package util

import org.scalatest.{DoNotDiscover, FreeSpec, Matchers}
import permissions.{TrainingPermission, EmailPermission, EditorialPermission, CommercialPermission}

@DoNotDiscover class AclTest extends FreeSpec with Matchers {

  "Grant access according to collection priorities" - {

    "Allow access to commercial fronts if commercial permissions" in {

      PermissionsChecker.check(AccessGranted, AccessDenied, AccessDenied, Set(CommercialPermission)) should be(AccessGranted)
    }

    "Allow access to editorial fronts if editorial permissions" in {

      PermissionsChecker.check(AccessDenied, AccessGranted, AccessDenied, Set(EditorialPermission)) should be(AccessGranted)

    }

    "Allow access to email fronts if editorial permissions"  in {
      PermissionsChecker.check(AccessDenied, AccessGranted, AccessDenied, Set(EmailPermission)) should be(AccessGranted)
    }

    "Allow access to training fronts if training permissions" in {

      PermissionsChecker.check(AccessDenied, AccessDenied, AccessGranted, Set(TrainingPermission)) should be(AccessGranted)

    }

    "Allow access to fronts shared between editorial and commercial if commercial permissions " in {

      PermissionsChecker.check(AccessGranted, AccessDenied, AccessDenied, Set(EditorialPermission, CommercialPermission)) should be(AccessGranted)
    }

    "Allow access to fronts shared between editorial and commercial if editorial permissions " in {

      PermissionsChecker.check(AccessDenied, AccessGranted, AccessDenied, Set(EditorialPermission, CommercialPermission)) should be(AccessGranted)
  }

    "Do not allow access if not access to any of the priorities " in {

      PermissionsChecker.check(AccessDenied, AccessDenied, AccessGranted, Set(EditorialPermission, CommercialPermission)) should be(AccessDenied)

    }

  }
}
