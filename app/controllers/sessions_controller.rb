class SessionsController < ApplicationController
  def auth_start
    PreAuth.call(params: params, session: session)
    redirect_to "/auth/twitter"
  end

  def auth_callback
    result = AuthUser.call(auth: auth_hash)

    set_user(result.user)

    post_auth = PostAuth.call(user: current_user, session: session)

    redirect_to "/"
  end

  def auth_failure
    @login_type = params[:strategy].to_s.capitalize.presence

    case params[:message]
    when "invalid_credentials"
      @login_error = "Invalid credentials. Please try logging in again."
    else
      @login_error = "Our app is broken."
    end

  end

  def logout
    if current_user.blank?
      redirect_to "/"
      return
    end
  end

  def logout_complete
    clear_user
    clear_subscriber

    flash[:message] = "You are now logged out."
    redirect_to "/"
  end

  protected

  def auth_hash
    request.env['omniauth.auth']
  end

  def get_twitter_auth(oauth_token, oauth_secret)
    client = Twitter::REST::Client.new do |config|
      config.consumer_key        = Settings.twitter_key
      config.consumer_secret     = Settings.twitter_secret
      config.access_token        = oauth_token
      config.access_token_secret = oauth_secret
    end

    client.user.to_hash
  end
end
