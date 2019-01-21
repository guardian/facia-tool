package test

import org.scalatest.Suites
import util.AclTest

class FaciaToolTestSuite extends Suites (
  new config.TransformationsSpec,
  new services.CollectionServiceTest,
  new metrics.DurationMetricTest,
  new util.SanitizeInputTest,
  new AclTest,
  new tools.FaciaApiTest) {}
