$(document).ready(() => {
  initializePagination(() => {
    $('#data-table > tbody > tr').each(function () {
      let id = $(this).data('id');
      $(this).dblclick((e) => {
        e.preventDefault();
        $.ajax({
          url: `/patients/${id}`,
          method: 'GET'
        }).fail((jqXHR, textStatus) => {
          alert('Request failed: ' + textStatus);
        }).done((data) => {
          let buffer = data.photo;
          let image = "data:image/png;base64," + btoa(String.fromCharCode.apply(null, buffer.data));
          createModal('Person Info', 'person-modal', (modal, modalBody, modalFooter) => {
            modalBody.append(data.html);
            $('#person', modalBody).attr('src', image);
            $('<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>')
              .appendTo(modalFooter);
          });
        });
      });
    });
  });
  $('#delete-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    if (!record.length) return;
    openDeleteModal('Delete Record', 'delete-modal', `/patients/${record.data('id')}${generateFilter()}`);
  });
  $('#edit-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    let id = record.data('id');
    if (!record.length) return;
    $.ajax({
      url: `/patients/${id}/edit`,
      method: 'GET'
    }).fail((jqXHR, textStatus) => {
      alert('Request failed: ' + textStatus);
    }).done((html) => {
      createModal('Edit Person', 'person-edit-modal', (modal, modalBody, modalFooter) => {
        modalBody.append(html);
        $('#patient-form', modalBody).submit(function (e) {
          e.preventDefault();
          let formData = new FormData($(this).get(0));
          $.ajax({
            method: 'PUT',
            url: `/patients/${id}/edit${generateFilter()}`,
            data: formData,
            processData: false,
            contentType: false
          }).done((data) => {
            refreshTable(data, 'person-edit-modal');
          }).fail((jqXHR, textStatus) => {
            alert("Request failed: " + textStatus);
          });
        });
        $('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>')
          .appendTo(modalFooter);
        $('<button type="button" id="submit-btn" class="btn btn-primary">Save</button>')
          .click(() => {
            $('#patient-form').submit();
          }).appendTo(modalFooter);
      });
    });
  });
  $('#res-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    if (!record.length) return;
    window.location.href = `/patients/${record.data('id')}/residence`;
  });
  $('#card-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    if (!record.length) return;
    window.location.href = `/patients/${record.data('id')}/card`;
  });
});