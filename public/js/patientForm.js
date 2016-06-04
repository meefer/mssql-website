$(document).ready(() => {
  $('button[type="submit"]').click((e) => {
    e.preventDefault();
    let formData = new FormData($('#patient-form').get(0));
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
});