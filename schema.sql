-- Projects table to store high-level metadata
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    metadata JSON NOT NULL,
    current_stage TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stages table to store the state of each discovery stage
CREATE TABLE IF NOT EXISTS stages (
    project_id TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    input TEXT,
    output TEXT,
    status TEXT NOT NULL,
    questions JSON,
    answers JSON,
    grounding_sources JSON,
    search_entry_point_html TEXT,
    coherence_score INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, stage_name),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Versions table for history tracking
CREATE TABLE IF NOT EXISTS stage_versions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    input TEXT,
    output TEXT,
    questions JSON,
    coherence_score INTEGER,
    search_entry_point_html TEXT,
    FOREIGN KEY (project_id, stage_name) REFERENCES stages(project_id, stage_name) ON DELETE CASCADE
);
