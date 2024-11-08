package services

class Press(val faciaPress: FaciaPress) {
  def fromSetOfIds(ids: Set[String]) = {
    faciaPress.press(
      PressCommand(
        ids,
        live = true,
        draft = true
      )
    )
  }

  def fromSetOfIdsWithForceConfig(ids: Set[String]) = {
    faciaPress.press(
      PressCommand(
        ids,
        live = true,
        draft = true,
        forceConfigUpdate = Option(true)
      )
    )
  }
}
