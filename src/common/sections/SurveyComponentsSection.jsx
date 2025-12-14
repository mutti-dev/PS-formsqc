import {
    Badge,
    Card,
    Row,
    Col
} from "react-bootstrap";
import CollapsibleSection from "../CollapsibleSection";


function SurveyComponentsSection({ surveyValues }) {
  if (surveyValues.length === 0) return null;

  return (
    <CollapsibleSection
      title="Survey Components"
      count={surveyValues.length}
      defaultOpen={false}
    >
      <Row>
        {surveyValues.map((survey, idx) => (
          <Col md={6} lg={4} key={idx} className="mb-3">
            <Card className="h-100 border">
              <Card.Body>
                <Card.Title className="fs-6 fw-semibold">
                  {survey.label}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted font-monospace fs-7">
                  Key: {survey.key}
                </Card.Subtitle>
                <div className="d-flex flex-wrap gap-1">
                  {survey.questions.map((q, qIdx) => (
                    <Badge key={qIdx} bg="dark" text="dark" className="border">
                      {q.label} ({q.value})
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </CollapsibleSection>
  );
}

export default SurveyComponentsSection