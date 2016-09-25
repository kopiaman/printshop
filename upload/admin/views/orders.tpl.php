@extend('layout.tpl.php')

@block('content')

    <div class="row">
		<div class="col-md-6">
			<h3>Orders</h3>
			<? if($query) : ?>
			<p>Showing results for "<?= $query ?>" (<a href="<?= site_url('orders') ?>">Reset</a>)</p>
			<? else: ?>
			<p>View and manage your orders placed in the last 30 days</p>
			<? endif; ?>
		</div>
		<div class="col-md-6">
			<form class="form-inline pull-right" role="form" style="margin-top: 30px;" action="<?= site_url('orders') ?>">
			  <div class="form-group">
				<div class="input-group">
				  <input type="text" name="query" class="form-control" placeholder="customer or order no.">
				</div>
			  </div>
			  <button type="submit" class="btn btn-default">Search</button>
			</form>
		</div>
	</div>
	<hr /><br />
	<? if(isset($_SESSION['success'])) : ?>
		<div class="alert alert-success" role="alert"><?= $_SESSION['success'] ?></div>   
	<? endif; ?>
	<? if(count($orders) == 0) : ?>
		<p class="text-center">No orders yet.</p>
	<? else: ?>
	<table class="table table-striped table-orders">
      <thead>
		 <tr>
          <th>#</th>
          <th>Customer name</th>
          <th class="text-right">Price</th>
          <th class="text-right">Date ordered</th>
          <th class="text-right">Time ordered</th>
          <th class="text-right">Dispatched</th>
        </tr>
      </thead>
      <tbody>
		@foreach($orders as $order)
        <tr>
          <td><a href="<?= site_url('orders/view?id='.$order->id) ?>">@($order->id)</a></td>
          <td>@($order->firstname) @($order->lastname)</td>
          <td class="text-right"><?= number_format((float) $order->amount, 2) ?> <?= $order->currency ?></td>
          <td class="text-right"><?= $carbon->parse($order->created_at)->toFormattedDateString() ?></td>
          <td class="text-right"><?= $carbon->parse($order->created_at)->toTimeString() ?></td>
          <td class="text-right"><?= ($order->dispatched)?'YES':'NO' ?></td>
          <td class="text-right"><a href="<?= site_url('orders/view?id='.$order->id) ?>">View</a>&nbsp;&nbsp;&nbsp;<a href="#" data-id="<?= $order->id ?>" class="delete-order" data-toggle="tooltip" data-placement="right" title="Delete order"><i class="fa fa-times"></i></a></td>
        </tr>
		@endforeach
      </tbody>
    </table>
	
	<ul class="pagination">
	  <li><a href="<?= site_url('orders') ?>?query=<?= $query ?>&page=<?= $previous_page ?>">&laquo;</a></li>
	  <? for($page = 1; $page <= $max_pages; $page++) : ?>
	  <li class="<?= ($page == $current_page)?'active':'' ?>"><a href="<?= site_url('orders') ?>?query=<?= $query ?>&page=<?= $page ?>"><?= $page ?></a></li>
	  <? endfor; ?>
	  <li><a href="<?= site_url('orders') ?>?query=<?= $query ?>&page=<?= $next_page ?>">&raquo;</a></li>
	</ul>
	<? endif; ?>

<script>
	$(function() {
		$('.delete-order').on('click', function() {
			var me = $(this);
			swal({
				title: "Are you sure?",
				text: "You will not be able to recover this order!",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				confirmButtonText: 'Yes, delete it!',
				closeOnConfirm: false
			},
			function(){
				var url = '<?= site_url('orders/delete?id=') ?>' + me.data('id');
				window.location.href = url;
			});
			return false;
		});
	});
</script>
	

@endblock