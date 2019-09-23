package permissions

import com.gu.facia.client.models.{ConfigJson, FrontJson}
import org.scalatest.{FreeSpec, Matchers}

class CollectionPermissionsTest extends FreeSpec with Matchers {

  def getFront(name: String, priority: String, collections: List[String]) =
    FrontJson(collections, None, None, Some(name), None, None, None,
      None, None, None, Some(priority), None, None, None)

  val front1 = getFront("commercial front 1", "commercial", List("a", "b", "x"))
  val front2 = getFront("editorial front 1", "editorial", List("c", "d"))
  val front3 = getFront("email front 1", "email", List("e", "f"))
  val front4 = getFront("training front 1", "training", List("g", "h"))
  val front5 = getFront("dual front 1", "email", List("x"))

  val configJson = ConfigJson(
    Map(
      ("front1" -> front1),
      ("front2" -> front2),
      ("front3" -> front3),
      ("front4" -> front4),
      ("front5" -> front5)
    ),
    Map()
  )

  "Collection Permission correctly inferred" - {
    "a commercial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "a") should contain (CommercialPermission)
    }
    "a non commercial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "c") should not contain (CommercialPermission)
    }
    "a non editions collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "a") should not contain (EditionsPermission)
    }

  }

  "Editorial Permission correctly inferred" - {
    "an editorial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "c") should contain (EditorialPermission)
    }
    "a non editorial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "a") should not contain (EditorialPermission)
    }
    "a non editions collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "c") should not contain (EditionsPermission)
    }

  }

  "Email Permission correctly inferred" - {
    "an email collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "e") should contain (EmailPermission)
    }
    "a non email collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "a") should not contain (EmailPermission)
    }
    "a non editions collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "e") should not contain (EditionsPermission)
    }

  }

  "Training Permission correctly inferred" - {
    "an training collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "g") should contain (TrainingPermission)
    }
    "a non training collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "a") should not contain (TrainingPermission)
    }
    "a non editions collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "g") should not contain (EditionsPermission)
    }

  }

  "Dual Permissions correctly inferred" - {
    "an commercial AND email collection" in {
      val s = CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "x")
      s should contain (CommercialPermission)
      s should contain (EmailPermission)
      s should not contain (EditionsPermission)
    }
  }

  "Editions Permission correctly inferred" - {
    "an editions collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "z") should contain (EditionsPermission)
    }
    "a non commercial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "z") should not contain (CommercialPermission)
    }
    "a non editorial collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "z") should not contain (EditorialPermission)
    }
    "a non training collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "z") should not contain (TrainingPermission)
    }
    "a non email collection" in {
      CollectionPermissions.getFrontsPermissionsPriorityByCollectionId(Some(configJson), "z") should not contain (EmailPermission)
    }


  }

}
