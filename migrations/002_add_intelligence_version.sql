-- Add intelligence versioning and new v1.0.0 fields to ticket_analysis

-- Add intelligence_version column to track which intelligence produced the analysis
ALTER TABLE ticket_analysis
ADD COLUMN intelligence_version VARCHAR(50) NOT NULL DEFAULT 'support-intel-v1.0.0';

-- Add confidence scoring (0.0-1.0)
ALTER TABLE ticket_analysis
ADD COLUMN confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5
CHECK (confidence >= 0.0 AND confidence <= 1.0);

-- Add evidence array for justification
ALTER TABLE ticket_analysis
ADD COLUMN evidence TEXT[] NOT NULL DEFAULT '{}';

-- Create index on intelligence_version for filtering/comparison
CREATE INDEX idx_ticket_analysis_intelligence_version ON ticket_analysis(intelligence_version);

-- Create index on confidence for filtering low-confidence analyses
CREATE INDEX idx_ticket_analysis_confidence ON ticket_analysis(confidence DESC);

-- Critique data table (separate from main analysis for auditability)
CREATE TABLE ticket_analysis_critique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_analysis_id UUID NOT NULL REFERENCES ticket_analysis(id) ON DELETE CASCADE,
    critique_confidence DECIMAL(3,2) NOT NULL CHECK (critique_confidence >= 0.0 AND critique_confidence <= 1.0),
    critique_notes TEXT[] NOT NULL DEFAULT '{}',
    inconsistencies TEXT[] NOT NULL DEFAULT '{}',
    missing_evidence TEXT[] NOT NULL DEFAULT '{}',
    flags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(ticket_analysis_id)
);

CREATE INDEX idx_critique_ticket_analysis_id ON ticket_analysis_critique(ticket_analysis_id);
CREATE INDEX idx_critique_confidence ON ticket_analysis_critique(critique_confidence DESC);
CREATE INDEX idx_critique_flags ON ticket_analysis_critique USING GIN(flags);

-- Comment on new columns for documentation
COMMENT ON COLUMN ticket_analysis.intelligence_version IS 'Version of the intelligence that produced this analysis (e.g., support-intel-v1.0.0). Enables comparing results across prompt/schema changes.';
COMMENT ON COLUMN ticket_analysis.confidence IS 'AI model confidence in analysis accuracy (0.0-1.0). Values below 0.5 may require human review.';
COMMENT ON COLUMN ticket_analysis.evidence IS 'Textual justifications for the ratings. Should reference specific phrases from the ticket.';
COMMENT ON TABLE ticket_analysis_critique IS 'Quality assurance critique of analysis results. Stores second-pass validation to catch inconsistencies.';
