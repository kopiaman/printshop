@extend('layout.tpl.php')

@block('content')
  
  <h3>Add product</h3>
	<hr /><br />
  <? if(isset($_SESSION['error'])) : ?>
    <div class="alert alert-danger" role="alert"><?= $_SESSION['error'] ?></div>   
  <? endif; ?>
  <form role="form" action="<?= site_url('products/add') ?>" method="POST">
  <div class="form-group">
    <label>Product name</label>
    <input type="product" class="form-control" name="name" required min="1" max="32" value="<?= @$_SESSION['vars']['name'] ?>">
  </div>
  <div class="form-group">
    <label>Category</label>
    <select class="form-control" name="category">
        <? foreach($categories as $category) : ?>
          <option <?= ($category['name'] == @$_SESSION['vars']['description'] ) ?'selected':'' ?> value="<?= $category['name'] ?>"><?= $category['name'] ?></option>
        <? endforeach; ?>
    </select>
  </div>  
  <div class="form-group">
    <label>Description</label>
    <textarea class="form-control" rows="8" name="description" required value="<?= @$_SESSION['vars']['description']  ?>"></textarea>
  </div>

   <div class="row">
    <div class="col-md-12">
      <br />

  <button type="submit" class="btn btn-primary pull-right">Continue</button>
</div>
</div>
</form>

      <br />
      <br />

  <p>* Note: You can add variants, set editable areas and customize your product in the next page</p>


@endblock