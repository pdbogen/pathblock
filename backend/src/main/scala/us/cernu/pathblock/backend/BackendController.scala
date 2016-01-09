package us.cernu.pathblock.backend

/**
  * Created by developer on 1/9/16.
  */

import com.google.inject.Inject
import com.twitter.finagle.exp.mysql.Client
import com.twitter.finagle.http.Request
import com.twitter.finatra.http.Controller
import AuthContext.AuthContextMagic
import com.twitter.finatra.http.response.ResponseBuilder
import com.twitter.util.{Throw, Return}

class BackendController @Inject()(model: Model,
                                  mysql: Client,
                                  responseBuilder: ResponseBuilder
                                 ) extends Controller {
  put("/api/v1/token", "createToken") { request: Request =>
    Token.generate(mysql) map {
      _.underlying
    }
  }

  get("/api/v1/datum/:name", "getDatum") { request: Request =>
    val name = request.params("name")
    model.datum(request.token, name) map {
      case Some(Datum(_, v)) => v
      case None => ""
    }
  }

  put("/api/v1/datum/:name", "putDatum") { request: Request =>
    val name = request.params("name")
    val value = request.contentString
    Datum(name, value).save(request.token, mysql).liftToTry map {
      case Return(_) => responseBuilder.ok
      case Throw(_) => responseBuilder.internalServerError
    }
  }
}
