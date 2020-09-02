package model.editions.templates

import scala.language.postfixOps

case class Capi(val string: String, val next: Option[Capi] = None) {
  override def toString = string + (if (next.isDefined) next.get.toString else "")
  private def add(string: String): Capi = add(Capi(string))
  private def add(newNext: Capi): Capi= {
    if (!next.isDefined)
      this.copy(next = Some(newNext))
    else
      this.copy(next = next map(_ add newNext))
  }
  def and(c:Capi) = c match {
    case Capi(_, None) => this.add(Capi(",")).add(c)
    case Capi(_, Some(c2)) => this.add(Capi(",")) .add("(").add(c).add(")")
  }
  def andnot(c:Capi) = c match {
    case Capi(_, None) => this.add(Capi(",-")).add(c)
    case Capi(_, Some(c2)) => this.add(Capi(",-")) .add("(").add(c).add(")")
  }
  def or(c:Capi) = add(Capi("|")).add(c)
  def tag(s:String) = Capi(s)
  def build(c:Capi) = this.copy(next = Some(c))
}

object Capi{
  def apply() = new Capi("?tag=")
  def apply(s: String) = new Capi(s)
  def article=Capi("type/article")
  def lifeandstyle=Capi("lifeandstyle/lifeandstyle")

  def features=Capi("tone/features")
  def reviews=Capi("tone/reviews")
  def interview=Capi("tone/interview")
  def news=Capi("tone/news")
  def minutebyminute=Capi("tone/minutebyminute")
  def analysis=Capi("tone/analysis")
  def explainer=Capi("tone/explainer")

  def food=Capi("food/food")
  def family=Capi("lifeandstyle/family")
  def fashion=Capi("fashion/fashion")
  def healthandwellbeing=Capi("lifeandstyle/health-and-wellbeing")
  def fitness=Capi("lifeandstyle/fitness")
  def australianews=Capi("australia-news/australia-news")
  def australianpolitics = Capi("australia-news/australian-politics")
  def businessaustralia=Capi("australia-news/business-australia")
  def australiamedia=Capi("media/australia-media")

  def culture=Capi("culture/culture")
  def lifestyle=Capi("lifestyle/lifestyle")
  def comment=Capi("tone/comment")
}
