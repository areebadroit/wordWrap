// alert("connected");
$('.message .close')
  .on('click', function() {
    $(this)
    // .closest('.message')
    .parent()
    .transition('fade')
    ;
  })
;