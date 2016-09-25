@extend('layout.tpl.php')

@block('content')

<ul class="nav nav-tabs">
      <li role="presentation" class="active"><a href="<?= site_url('products') ?>">Products</a></li>
      <li role="presentation"><a href="<?= site_url('categories') ?>">Categories</a></li>
      <li role="presentation"><a href="<?= site_url('variants') ?>">Variants</a></li>
    </ul>
<br />
<? if(isset($_SESSION['success'])) : ?>
    <div class="alert alert-success" role="alert"><?= $_SESSION['success'] ?></div>   
<? endif; ?>
<div class="row">
<div class="col-md-8">
  <h3>Products</h3>
  <p>Fill out your product details. All products need to the printable dimensions, the editable areas, what category it fits in and the pricing.</p>
</div>
<div class="col-md-4">
  <br />
  <br />
  <br />
    <a href="<?= site_url('products/add') ?>" class="btn btn-primary  pull-right">Add new product</a>
</div>
</div>
  <hr />

	<table class="table table-striped" id="products">
      <thead>
		 <tr>
          <th >Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Options</th>
        </tr>
      </thead>
      <tbody>
        <? foreach($products as $product) : ?>
        <tr>
          <td><?= $product['name'] ?></td>
          <td><?= $product['category'] ?></td>
          <td><?= $product['price'] ?></td>
          <td><a href="<?= site_url('products/edit/'.$product['slug']) ?>">Edit</a>  |  
			 <a data-slug="<?= $product['slug'] ?>" href="#" class="remove">Remove</a></td>
        </tr>
        <? endforeach; ?>

      </tbody>
    </table>
    <br />
    <br />
<script>
var table = null;
$(document).ready(function() {
    
	table = $('#products').DataTable( {
        "order": [[ 1, "asc" ]]
	} );
	
	function deleteProduct(row, slug) {
		console.log(slug);
		swal({
			title: "Are you sure?",
			text: "You will not be able to recover this product!",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: '#DD6B55',
			confirmButtonText: 'Yes, delete it!',
			closeOnConfirm: true
		},
		function(isConfirm){
			if (isConfirm) {
				$.ajax({
				  url: '<?= site_url('products/remove/') ?>' + slug,
				}).done(function(result) {
					table.row(row).remove().draw( false );
				});
			
				return true;
			} else {
				return false;
			} 
		});
	}
	$("body").on("click", ".remove", function(e){
		var row = $(this).parents('tr');
		var slug = $(this).data('slug');
		
		deleteProduct(row, slug);

		return false;

});

	

	
} );
</script>
@endblock