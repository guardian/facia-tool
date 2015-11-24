package test

import metrics.DurationMetricTest
import org.scalatest.Suites

class FaciaToolTestSuite extends Suites (
  new config.TransformationsSpec,
  new DurationMetricTest,
  new services.FaciaToolHealthcheckTest,
  new util.EnumeratorsTest,
  new util.RichFutureTest,
  new util.SanitizeInputTest,
  new tools.FaciaApiTest) with SingleServerSuite {}
