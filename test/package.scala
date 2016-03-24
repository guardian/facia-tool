package test

import org.scalatest.Suites

class FaciaToolTestSuite extends Suites (
  new config.TransformationsSpec,
  new metrics.DurationMetricTest,
  new util.SanitizeInputTest,
  new tools.FaciaApiTest) {}
