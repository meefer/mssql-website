$(document).ready(() => {
  $('button[type="submit"]').click((e) => {
    e.preventDefault();
    let formData = new FormData($('#patient-form').get(0));
    for (var pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
    $.ajax({
      method: 'POST',
      url: '/patients/new',
      data: formData,
      processData: false,  // tell jQuery not to process the data
      contentType: false,  // tell jQuery not to set contentType
      error: (e) => {
        alert(JSON.stringify(e));
      }
    });
  });

  // $.ajax({
  //   method: 'GET',
  //   url: '/photo',
  //   success: function (data) {
  //     let buffer = data.image[0].Photo;
  //     let image = "data:image/png;base64," + btoa(String.fromCharCode.apply(null, buffer.data));
  //     $('#image').attr('src', image);
  //   }
  // });
});