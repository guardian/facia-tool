package services.editions.publishing

import model.packages.{Package, PackageCard}

trait PackagePublicationTarget {
  def putPackage(pkg: Package, cards: Seq[PackageCard]): Either[String, Unit]
}
