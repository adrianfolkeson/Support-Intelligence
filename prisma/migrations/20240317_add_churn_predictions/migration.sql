-- Create churn_predictions table
CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Prediction results
  churn_risk INT NOT NULL CHECK (churn_risk >= 0 AND churn_risk <= 100),
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  predicted_churn_date TIMESTAMP,

  -- Analysis details
  key_factors JSONB DEFAULT '[]'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,

  -- Customer metrics snapshot
  customer_metrics JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  prediction_source VARCHAR(100) DEFAULT 'aurora_api',
  batch_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Foreign keys
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_churn_predictions_customer_id ON churn_predictions(customer_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_organization_id ON churn_predictions(organization_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_risk_level ON churn_predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_churn_risk ON churn_predictions(churn_risk);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_created_at ON churn_predictions(created_at DESC);

-- Create index for high-risk customers
CREATE INDEX IF NOT EXISTS idx_churn_predictions_high_risk ON churn_predictions(customer_id)
  WHERE churn_risk >= 50;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_churn_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_churn_predictions_updated_at
  BEFORE UPDATE ON churn_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_churn_predictions_updated_at();

-- Add comment
COMMENT ON TABLE churn_predictions IS 'Stores churn risk predictions from Aurora AI';
COMMENT ON COLUMN churn_predictions.churn_risk IS 'Churn risk score from 0-100';
COMMENT ON COLUMN churn_predictions.risk_level IS 'Risk classification: low, medium, high, or critical';
COMMENT ON COLUMN churn_predictions.confidence IS 'Prediction confidence score from 0-100';
COMMENT ON COLUMN churn_predictions.key_factors IS 'Array of factors contributing to churn risk';
COMMENT ON COLUMN churn_predictions.recommended_actions IS 'Array of recommended retention actions';
