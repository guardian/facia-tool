package util

object Seqs {
  implicit class RichSeq[A](as: Seq[A]) {
    def isDescending(implicit ordering: Ordering[A]) = as == reverseSorted

    def reverseSorted(implicit ordering: Ordering[A]) =
      as.sorted(ordering.reverse)
  }
}
