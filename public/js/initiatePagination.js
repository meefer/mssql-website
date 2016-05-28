$(document).ready(() => {
  $('#pagination').twbsPagination({
    totalPages: $('#pagination').data('total'),
    visiblePages: 20,
    onPageClick: (event, page) => {
      $.ajax({
        url: `/buildings?page=${page}`,
        method: 'GET'
      }).fail((jqXHR, textStatus) => {
        alert('Request failed: ' + textStatus);
      }).done((data) => {
        refreshTable(data);
      });
    }
  });
});

let renderTable = (data, sortNumber, asc) => {
  const ID = 'Id';
  let table = $('<table></table>')
    .addClass('table table-bordered table-hover')
    .attr('id', 'data-table');
  let tHead = $('<thead></thead>');
  let tr = $('<tr></tr>');
  Object.keys(data[0]).forEach((header, i) => {
    if (header === ID) return;
    let th = $('<th></th>').text(`${header} `)
      .click(function (e) {
        e.stopPropagation();
        let url = `/buildings?order=${header}&asc=`;
        let asc = !($(this).children('span').attr('class').split(' ').some((c) => c == 'glyphicon-sort-by-attributes'));
        $.ajax({
          method: 'GET',
          url: `${url}${asc}${generateFilter('&')}`
        }).done((data) => {
          refreshTable(data, null, i, asc);
        }).fail((jqXHR, textStatus) => {
          alert("Request failed: " + textStatus);
        });
      });
    let icon = $('<span></span>').addClass('glyphicon').attr('aria-hidden', 'true');
    if (i === sortNumber) {
      icon.addClass(asc ? 'glyphicon-sort-by-attributes' : 'glyphicon-sort-by-attributes-alt');
    }
    else {
      icon.addClass('glyphicon-sort');
    }
    th.append(icon);
    tr.append(th);
  });
  tHead.append(tr);
  let tBody = $('<tbody></tbody>');
  for (let record of data) {
    tr = $('<tr></tr>').click(function () {
      $('#data-table > tbody > tr').each(function () {
        $(this).removeClass('active');
      });
      $(this).addClass('active');
    });
    for (let header in record) {
      if (header === ID) {
        tr.attr('data-id', record[ID]);
        continue;
      }
      let td = $('<td></td>').text(record[header]);
      tr.append(td);
    }
    tBody.append(tr);
  }
  table.append(tHead);
  table.append(tBody);
  $('#page-content').append(table);
}

let createModal = (name, id, fill) => {
  let modal = $(`<div class="modal fade" id="${id}" tabindex="-1" role="dialog" aria-labelledby="modal-label"></div>`);
  let modalDialog = $('<div></div>').addClass('modal-dialog').attr('role', 'document');
  let modalContent = $('<div></div>').addClass('modal-content');
  let modalHeader = $('<div></div>').addClass('modal-header');
  $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
    .appendTo(modalHeader);
  $('<h4></h4>').addClass('modal-title').attr('id', 'modal-label').text(name)
    .appendTo(modalHeader);
  let modalBody = $('<div></div>').addClass('modal-body');
  let modalFooter = $('<div></div>').addClass('modal-footer');

  fill(modal, modalBody, modalFooter);

  modalContent.append(modalHeader);
  modalContent.append(modalBody);
  modalContent.append(modalFooter);
  modalDialog.append(modalContent);
  modal.append(modalDialog);
  $(document.body).append(modal);

  $(`#${id}`).modal();
  $(`#${id}`).on('hidden.bs.modal', function () {
    $(this).remove();
  });
}

let refreshTable = (data, modalId, column = 1, asc = true) => {
  $('#data-table').remove();
  renderTable(data, column, asc);
  if (modalId) $(`#${modalId}`).modal('hide');
}

let openDeleteModal = (modalName, modalId, url) => {
  createModal(modalName, modalId, (modal, modalBody, modalFooter) => {
    modalBody.append($('<h1 class="h4"></h1>').text('Are you sure you wish to delete chosen row?'));

    $('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>')
      .appendTo(modalFooter);
    $('<button type="button" id="submit-btn" class="btn btn-primary">OK</button>')
      .click(() => {
        $.ajax({
          method: 'DELETE',
          url
        }).done((data) => {
          refreshTable(data, modalId);
        }).fail((jqXHR, textStatus) => {
          alert("Request failed: " + textStatus);
        });
      }).appendTo(modalFooter);
  });
}

let openEditModal = (modalName, modalId, method, url, record) => {
  createModal(modalName, modalId, (modal, modalBody, modalFooter) => {
    let form = $('<form></form>').addClass('form-horizontal')
      .submit(function (e) {
        e.preventDefault();
        if($.grep($(':input', $(this)), (input) => $(input).val() === '').length != 0) return;
        $.ajax({
          method,
          url,
          data: $(this).serialize()
        }).done((data) => {
          refreshTable(data, modalId);
        }).fail((jqXHR, textStatus) => {
          alert("Request failed: " + textStatus);
        });
      })
      .attr('action', '/bulding').attr('method', 'post').attr('id', 'edit-form');

    $('#data-table > thead th').each(function (i) {
      let label = $(this).text();
      let id = `input-${label.toLowerCase()}`;
      let formGroup = $('<div></div>').addClass('form-group');

      $('<label></label>').addClass('col-sm-2 control-label').attr('for', id)
        .text(label).appendTo(formGroup);

      let input = $('<input></input>').addClass('form-control')
        .attr('type', 'text').attr('id', id).attr('name', label);
      if (record) {
        input.val(record.children().eq(i).text());
      }

      $('<div></div>').addClass('col-sm-10').append(input).appendTo(formGroup);

      form.append(formGroup);
    });

    modalBody.append(form);
    /*
    <form class="form-horizontal">
        <div class="form-group">
            <label for="inputEmail3" class="col-sm-2 control-label">Email</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="inputEmail3" placeholder="Email">
            </div>
        </div>
    */

    $('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>')
      .appendTo(modalFooter);
    $('<button type="button" id="submit-btn" class="btn btn-primary">Save</button>')
      .click(() => {
        $('#edit-form').submit();
      }).appendTo(modalFooter);
  });
}
/*
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="modal-label">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="myModalLabel">Modal title</h4>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>
*/
$('#edit-btn').click(() => {
  let record = $('#data-table > tbody > tr[class$="active"]');
  if (!record.length) return;
  openEditModal('Record Editor', 'edit-modal', 'PUT', `/building/${record.data('id')}`, record);
});

$('#new-btn').click(() => {
  openEditModal('New Record', 'new-modal', 'POST', '/building');
});

$('#delete-btn').click(() => {
  let record = $('#data-table > tbody > tr[class$="active"]');
  if (!record.length) return;
  openDeleteModal('Delete Record', 'delete-modal', `/building/${record.data('id')}`);
});

let filterQuery = '';
let generateFilter = (beginningSymbol) => {
  return `${beginningSymbol}${filterQuery}`;
}
$('#filter-btn').click(() => {
  let column = $('#dropdown-btn').text().split(' ')[0],
    value = $('#column-input').val().trim(), query;
  if (column === '' || value === '') query = '';
  else query = `&filter=${column}&value=${value}`;
  $.ajax({
    method: 'GET',
    url: `/buildings?page=1${query}`
  }).done((data) => {
    refreshTable(data);
    filterQuery = query.slice(1, query.length);
  }).fail((jqXHR, textStatus) => {
    filterQuery = '';
    alert("Request failed: " + textStatus);
  });
});

$('#dropdown-btn').one('click', () => {
  let dropdown = $('#column-dropdown');
  $('#data-table > thead th').each(function () {
    dropdown.append($('<li></li>').append(
      $('<a></a>').attr('href', '#').text($(this).text().split(' ')[0])
    ));
  });
  $('li a', dropdown).eq(0).click();
});
$('#column-dropdown').on('click', 'li a', function (e) {
  e.preventDefault();
  $('#dropdown-btn').html(`${$(this).text()} <span class="caret"></span>`);
});