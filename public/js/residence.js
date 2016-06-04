$(document).ready(() => {
  initializePagination();
  $('#move-btn').click(() => {
    $.ajax({
      method: 'GET',
      url: `/${tableURL}/move`
    }).fail((jqXHR, textStatus) => {
      alert('Request failed: ' + textStatus);
    }).done((html) => {
      createModal('Move ' + $('#name-panel').data('name'), 'person-move-modal', (modal, modalBody, modalFooter) => {
        modalBody.append(html);
        $('#move-form', modalBody).submit(function (e) {
          e.preventDefault();
          let roomId = $('#room-select :selected').val();
          $.ajax({
            method: 'POST',
            url: `/${tableURL}/move${generateFilter()}`,
            data: { RoomId: roomId },
          }).done((data) => {
            refreshTable(data, 'person-move-modal');
          }).fail((jqXHR, textStatus) => {
            alert("Request failed: " + textStatus);
          });
        });
        $('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>')
          .appendTo(modalFooter);
        $('<button type="button" id="submit-btn" class="btn btn-primary">Move</button>')
          .click(() => {
            $('#move-form').submit();
          }).appendTo(modalFooter);
      });
    });
  });
  $('#edit-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    let id = record.data('id');
    if (!record.length) return;
    $.ajax({
      method: 'GET',
      url: `/${tableURL}/edit/${id}`
    }).fail((jqXHR, textStatus) => {
      alert('Request failed: ' + textStatus);
    }).done((html) => {
      createModal('Edit residence history record', 'edit-modal', (modal, modalBody, modalFooter) => {
        modalBody.append(html);
        $('#edit-form', modalBody).submit(function (e) {
          e.preventDefault();
          let formData = $(this).serialize();
          $.ajax({
            method: 'PUT',
            url: `/${tableURL}/edit/${id}${generateFilter()}`,
            data: formData,
          }).done((data) => {
            refreshTable(data, 'edit-modal');
          }).fail((jqXHR, textStatus) => {
            alert("Request failed: " + textStatus);
          });
        });
        $('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>')
          .appendTo(modalFooter);
        $('<button type="button" id="submit-btn" class="btn btn-primary">Save</button>')
          .click(() => {
            $('#edit-form').submit();
          }).appendTo(modalFooter);
      });
    });
  });
  $('#delete-btn').click(() => {
    let record = $('#data-table > tbody > tr[class$="active"]');
    if (!record.length) return;
    openDeleteModal('Delete Record', 'delete-modal', `/${tableURL}/${record.data('id')}${generateFilter()}`);
  });
});