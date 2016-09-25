<!DOCTYPE html>
<html lang="en" ng-app="app" flow-init><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <title>PrintPixel - your product customization shopping cart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
	<link href="<?= base_url('css/bootstrap.css') ?>" rel="stylesheet">
	<link href="<?= base_url('css/theme.css') ?>" rel="stylesheet">
	<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.2/jquery.js"></script>
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
<style>
/* Snippet One */

body {
    background-color: #2E3037;
	}

div.member_signin {
    text-align: center;
}

div.member_signin  i.fa.fa-user {
    color: #FFF;
    background-color: #FFD202;
    border-radius: 500px;
    font-size: 36px;
    padding: 15px 20px 15px 20px;
}

div.fa_user {
    margin-top: -47px;
    margin-bottom: 15px;
}

p.member {
    font-size: 19px;
    color: #888888;
    margin-bottom: 20px;
}

button.login {
    width: 100%;
    text-transform: uppercase;
}

form.loginform div.input-group {
    width: 100%;
}

form.loginform input[type="text"], form.loginform input[type="password"] {
    color: #6C6C6C;
    text-align: center;
}

p.forgotpass {
    margin-top: 10px;
}

p.forgotpass a {
    color: #F5683D;
}
</style>
  </head>

  <body>

<div class="container" style="margin-top:10%">
  <div class="col-md-3 col-md-offset-4">
    <div class="panel member_signin">
      <div class="panel-body">
        <div class="fa_user">
          <i class="fa fa-user"></i>
        </div>
        <p class="member">Admin Login</p>
        <form role="form" class="loginform" action="<?= site_url('auth/login') ?>" method="POST">
			
        		<? if(isset($_SESSION['error'])) : ?>
		<div class="alert alert-warning" role="alert"><?= $_SESSION['error'] ?></div>		
	<? endif; ?>
          <div class="form-group">
            <label for="exampleInputEmail1" class="sr-only">Username</label>
            <div class="input-group">
              <input type="text" class="form-control" name="username" placeholder="Username">
            </div>
          </div>
          <div class="form-group">
            <label for="exampleInputPassword1" class="sr-only">Password</label>
            <div class="input-group">
              <input type="password" class="form-control" name="password" placeholder="Password">
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-md login">LOG IN</button>
        </form>
      </div>
    </div>
  </div>
</div>
	
	
</div>

<script>
$(function () {
  $('[data-toggle="popover"]').popover()
})
</script>

</body>
</html>