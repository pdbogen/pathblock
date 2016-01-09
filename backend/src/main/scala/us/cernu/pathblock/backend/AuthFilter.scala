package us.cernu.pathblock.backend

import com.google.inject.Inject
import com.twitter.finagle.http.{Request, Response}
import com.twitter.finagle.{Service, SimpleFilter}
import com.twitter.finatra.http.response.ResponseBuilder
import com.twitter.util.Future

/**
  * Created by developer on 1/9/16.
  */
object AuthContext {
  private val TokenField = Request.Schema.newField[Token]()
  implicit class AuthContextMagic(val request: Request) extends AnyVal {
    def token = request.ctx(TokenField)
  }
  private[backend] def setToken(request: Request, token: Token) {
    request.ctx.updateAndLock(TokenField,token)
  }
}
class AuthFilter @Inject()(model: Model, responseBuilder: ResponseBuilder)
  extends SimpleFilter[Request, Response] {
  override def apply(request: Request, service: Service[Request, Response]): Future[Response] = {
    model.tokens() flatMap { tokens =>
      if (tokens.isEmpty) {
        AuthContext.setToken(request,Token(""))
        service(request)
      } else {
        request.authorization match {
          case Some(t) if tokens.contains(Token(t)) =>
            AuthContext.setToken(request,Token(t))
            service(request)
          case _ => responseBuilder.unauthorized.toFuture
        }
      }
    }
  }
}
