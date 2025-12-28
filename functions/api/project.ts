export const onRequestGet: PagesFunction<{ discovery_db: D1Database }> = async ({ env }) => {
    try {
        const { results } = await env.discovery_db.prepare(
            "SELECT * FROM projects LIMIT 1"
        ).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: "No project found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const project = results[0] as any;

        // Get stages for the project
        const { results: stages } = await env.discovery_db.prepare(
            "SELECT * FROM stages WHERE project_id = ?"
        ).bind(project.id).all();

        // Get versions for all stages
        const { results: versions } = await env.discovery_db.prepare(
            "SELECT * FROM stage_versions WHERE project_id = ? ORDER BY created_at DESC"
        ).bind(project.id).all();

        // Reconstruct the AppState-like object
        const appState = {
            currentStage: project.current_stage,
            projectMetadata: JSON.parse(project.metadata),
            stages: stages.reduce((acc: any, stage: any) => {
                const stageVersions = (versions as any[])
                    .filter(v => v.stage_name === stage.stage_name)
                    .map(v => ({
                        id: v.id,
                        timestamp: new Date(v.created_at).getTime(),
                        output: v.output,
                        questions: JSON.parse(v.questions || '[]'),
                        coherenceScore: v.coherence_score
                    }));

                acc[stage.stage_name] = {
                    input: stage.input,
                    output: stage.output,
                    status: stage.status,
                    questions: JSON.parse(stage.questions || '[]'),
                    answers: JSON.parse(stage.answers || '{}'),
                    groundingSources: JSON.parse(stage.grounding_sources || '[]'),
                    searchEntryPointHtml: stage.search_entry_point_html,
                    coherenceScore: stage.coherence_score,
                    versions: stageVersions
                };
                return acc;
            }, {})
        };

        return new Response(JSON.stringify(appState), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

export const onRequestPost: PagesFunction<{ discovery_db: D1Database }> = async ({ request, env }) => {
    try {
        const body: any = await request.json();
        const { projectMetadata, currentStage, stages } = body;
        const projectId = "default-project"; // For now using a single project

        // Upsert project
        await env.discovery_db.prepare(`
      INSERT INTO projects (id, name, metadata, current_stage, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        metadata = excluded.metadata,
        current_stage = excluded.current_stage,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
            projectId,
            projectMetadata.companyName || "Unnamed Project",
            JSON.stringify(projectMetadata),
            currentStage
        ).run();

        // Sync stages and save versions
        for (const [stageName, stageData] of Object.entries(stages) as [string, any][]) {
            // Get current output to see if it changed
            const { results: currentStage } = await env.discovery_db.prepare(
                "SELECT output FROM stages WHERE project_id = ? AND stage_name = ?"
            ).bind(projectId, stageName).all();

            const hasChanged = stageData.status === 'completed' && (!currentStage.length || currentStage[0].output !== stageData.output);

            await env.discovery_db.prepare(`
        INSERT INTO stages (
            project_id, stage_name, input, output, status, 
            questions, answers, grounding_sources, 
            search_entry_point_html, coherence_score, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(project_id, stage_name) DO UPDATE SET
            input = excluded.input,
            output = excluded.output,
            status = excluded.status,
            questions = excluded.questions,
            answers = excluded.answers,
            grounding_sources = excluded.grounding_sources,
            search_entry_point_html = excluded.search_entry_point_html,
            coherence_score = excluded.coherence_score,
            updated_at = CURRENT_TIMESTAMP
      `).bind(
                projectId,
                stageName,
                stageData.input,
                stageData.output,
                stageData.status,
                JSON.stringify(stageData.questions || []),
                JSON.stringify(stageData.answers || {}),
                JSON.stringify(stageData.groundingSources || []),
                stageData.searchEntryPointHtml || null,
                stageData.coherenceScore || 0
            ).run();

            // Store in stage_versions if it's a new completed output
            if (hasChanged) {
                await env.discovery_db.prepare(`
                    INSERT INTO stage_versions (id, project_id, stage_name, output, questions, coherence_score, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `).bind(
                    crypto.randomUUID(),
                    projectId,
                    stageName,
                    stageData.output,
                    JSON.stringify(stageData.questions || []),
                    stageData.coherenceScore || 0
                ).run();
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
