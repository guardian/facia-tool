package permissions

import com.gu.pandomainauth.model.User



//case class Permission(name: String, app: String, defaultValue:Boolean=false)
//
//object PermissionsModel {
//
//  val ManageUsers = Permission("manage_users", App.global, defaultValue=false)
//  val ConfigureFronts = Permission("configure_fronts", App.fronts, defaultValue=false)
//
//  val all = List(ManageUsers, ConfigureFronts)
//
//  def getPermissions: List[Permission] =  all
//
//  def get(name: String): Option[Permission] = all find (_.name == name)
//
//}
//
//object App {
//  val fronts = "fronts"
//  val global = "global"
//}
