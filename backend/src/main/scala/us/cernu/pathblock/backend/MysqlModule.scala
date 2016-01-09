package us.cernu.pathblock.backend

import com.google.inject.{Provides, Singleton}
import com.twitter.finagle.exp.Mysql
import com.twitter.inject.TwitterModule

/**
  * Created by developer on 1/9/16.
  */
object MysqlModule extends TwitterModule {
  val host = flag("mysql.host", "localhost", "fqdn of mysql server to use")
  val port = flag("mysql.port", 3306, "port to use on mysql server")
  val user = flag("mysql.user", "pathblock", "username to use on mysql server")
  val pass = flag("mysql.pass", "", "password to use on mysql server")
  val db   = flag("mysql.db",   "pathblock", "database to use after login")

  @Singleton
  @Provides
  def providesMysqlClient = {
    Mysql.client
      .withCredentials(user(),pass())
      .withDatabase(db())
      .newRichClient(host() + ":" + port())
  }
}
