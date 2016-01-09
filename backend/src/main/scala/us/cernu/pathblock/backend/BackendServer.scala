package us.cernu.pathblock.backend

/**
  * Created by developer on 1/9/16.
  */

import com.twitter.finagle.http.Request
import com.twitter.finatra.http.HttpServer
import com.twitter.finatra.http.filters.{CommonFilters, ExceptionMappingFilter}
import com.twitter.finatra.http.internal.exceptions.FinatraDefaultExceptionMapper
import com.twitter.finatra.http.routing.HttpRouter

class BackendServer extends HttpServer {

  override val modules = Seq(MysqlModule)

  override def configureHttp(router: HttpRouter): Unit = {
    router
      .filter[CommonFilters]
      .filter[AuthFilter]
      .filter[ExceptionMappingFilter[Request]]
      .add[BackendController]
      .exceptionMapper[FinatraDefaultExceptionMapper]
  }
}