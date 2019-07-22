package util

import org.scalatest.{FreeSpec, Matchers}
import permissions.{CommercialPermission, EditorialPermission, EmailPermission, TrainingPermission}

class AclTest extends FreeSpec with Matchers {

  "Grant access according to collection priorities" - {

    "Allow access to commercial fronts if commercial permissions" in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessGranted,
        hasEditorialPermissions = AccessDenied,
        hasTrainingPermissions = AccessDenied,
        Set(CommercialPermission)
      ) should be(AccessGranted)
    }

    "Allow access to editorial fronts if editorial permissions" in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessDenied,
        hasEditorialPermissions = AccessGranted,
        hasTrainingPermissions = AccessDenied,
        Set(EditorialPermission)
      ) should be(AccessGranted)
    }

    "Allow access to email fronts if editorial permissions"  in {
      PermissionsChecker.check(
        hasCommercialPermissions = AccessDenied,
        hasEditorialPermissions = AccessGranted,
        hasTrainingPermissions = AccessDenied,
        Set(EmailPermission)
      ) should be(AccessGranted)
    }

    "Allow access to training fronts if training permissions" in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessDenied,
        hasEditorialPermissions = AccessDenied,
        hasTrainingPermissions = AccessGranted,
        Set(TrainingPermission)
      ) should be(AccessGranted)
    }

    "Allow access to fronts shared between editorial and commercial if commercial permissions " in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessGranted,
        hasEditorialPermissions = AccessDenied,
        hasTrainingPermissions = AccessDenied,
        Set(EditorialPermission, CommercialPermission)
      ) should be(AccessGranted)
    }

    "Allow access to fronts shared between editorial and commercial if editorial permissions " in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessDenied,
        hasEditorialPermissions = AccessGranted,
        hasTrainingPermissions = AccessDenied,
        Set(EditorialPermission, CommercialPermission)
      ) should be(AccessGranted)
  }

    "Do not allow access if not access to any of the priorities " in {

      PermissionsChecker.check(
        hasCommercialPermissions = AccessDenied,
        hasEditorialPermissions = AccessDenied,
        hasTrainingPermissions = AccessGranted,
        Set(EditorialPermission, CommercialPermission)
      ) should be(AccessDenied)

    }

  }
}
