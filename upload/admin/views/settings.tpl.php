@extend('layout.tpl.php')

@block('content')
<h3>Settings</h3>
<p>Edit your settings</p><hr /><br />

  <? if(isset($_SESSION['success'])) : ?>
    <div class="alert alert-success" role="alert"><?= $_SESSION['success'] ?></div>   
  <? endif; ?>
  
  <? if(isset($_SESSION['error'])) : ?>
    <div class="alert alert-warning" role="alert"><?= $_SESSION['error'] ?></div>   
  <? endif; ?>

<form role="form" class="form-horizontal" action="<?= site_url('settings/save') ?>" method="POST">
<div class="form-group">
    <label class="col-sm-3 control-label">Site name</label>
    <div class="col-sm-6">
    <input type="text" class="form-control" value="<?= @$settings['site_name'] ?>" name="site_name">
    </div>
  </div>
<div class="form-group">
    <label class="col-sm-3 control-label">Site url</label>
    <div class="col-sm-6">
    <input type="text" class="form-control" value="<?= @$settings['site_url'] ?>" name="site_url">
    </div>
  </div>
  
<div class="form-group">
    <label class="col-sm-3 control-label">Email</label>
    <div class="col-sm-6">
    <input type="text" class="form-control" value="<?= @$settings['email'] ?>" name="email">
    </div>
  </div>
       <hr />
<div class="form-group">
    <label class="col-sm-3 control-label">Shop currency</label>
    <div class="col-sm-4">
    <select name="currency" class="form-control">
        <? foreach($currencies as $currency) : ?>
          <option value="<?= $currency->code ?>" <? if($currency->code == @$settings['currency']): ?>selected<?endif; ?>><?= $currency->name ?> (<?= $currency->code ?>)</option>
        <? endforeach; ?>
    </select>   
	</div>
  </div>
      
<div class="form-group">
    <label class="col-sm-3 control-label">Default product</label>
    <div class="col-sm-4">
    <select name="default_product" class="form-control">
		<option value="">-- SELECT --</option>
        <? foreach($products as $product) : ?>
          <option value="<?= $product['slug'] ?>" <? if($product['slug'] == @$settings['default_product']): ?>selected<?endif; ?>><?= $product['name'] ?></option>
        <? endforeach; ?>
    </select>    
	</div>
  </div>
      
	<div class="form-group">
		<label class="col-sm-3 control-label">Language</label>
		<div class="col-sm-4">
		<select name="language" class="form-control">
			<? foreach($languages as $language) : ?>
			  <option value="<?= $language['code'] ?>" <? if($language['code'] == @$settings['language']): ?>selected<?endif; ?>><?= strtoupper($language['code']) ?></option>
			<? endforeach; ?>
		</select>    
		</div>
	  </div>
      <?/*
	<div class="form-group">
		<label class="col-sm-3 control-label">Print format</label>
		<div class="col-sm-4">
		<select name="print_format" class="form-control">
			<? foreach($print_formats as $print_format) : ?>
			  <option value="<?= $print_format ?>" <? if($print_format == @$settings['print_format']): ?>selected<?endif; ?>><?= strtoupper($print_format) ?></option>
			<? endforeach; ?>
		</select>    
		</div>
	  </div>
*/?>
     <hr />
	  <div class="form-group">
    <label class="col-sm-3 control-label">Admin password</label>
    <div class="col-sm-6">
    <input type="password" name="password" class="form-control" placeholder="Enter password" autocomplete="off">
    </div>
  </div>
	  <div class="form-group">
    <label class="col-sm-3 control-label">Admin password confirm</label>
    <div class="col-sm-6">
    <input type="password" name="confirm_password" class="form-control" placeholder="Confirm password" autocomplete="off">
    </div>
  </div>

  <hr />
  <button type="submit" class="btn btn-primary pull-right">Save settings</button>
</form>
<br />
<br />
@endblock