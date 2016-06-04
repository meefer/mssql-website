let initializePagination = () => {
  tableURL = $('#pagination').data('url');
  $('#pagination').twbsPagination({
    totalPages: $('#pagination').data('total'),
    visiblePages: 20,
    onPageClick: (_, page) => {
      requestPage(page);
    }
  });
};

let requestPage = (page) => {
  $.ajax({
    url: `/${tableURL}?page=${page}${generateFilter(true)}`,
    method: 'GET'
  }).fail((jqXHR, textStatus) => {
    alert('Request failed: ' + textStatus);
  }).done((data) => {
    refreshTable(data);
  });
}

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
        let url = `/${tableURL}?order=${header}&asc=`;
        let asc = !($(this).children('span').attr('class').split(' ').some((c) => c == 'glyphicon-sort-by-attributes'));
        $.ajax({
          method: 'GET',
          url: `${url}${asc}${generateFilter(true)}`
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

let filterQuery = '', tableURL = '';
let generateFilter = (appendingForm) => {
  return filterQuery ? `${appendingForm ? '&' : '?'}${filterQuery}` : '';
}
$.fn.textContent = function() {
  return this.contents().filter(function () {
    return this.nodeType == 3;
  }).text().trim();
}
let createFilterResetButton = () => {
  let resetButton = $('<button></button>').addClass('btn btn-default').attr('type', 'button');
  resetButton.append($('<span></span>').addClass('glyphicon glyphicon-remove glyphicon-btn').attr('aria-hidden', 'true'))
    .click(function () {
      filterQuery = '';
      requestPage(1);
      $(this).remove();
    }).insertBefore($('#dropdown-btn'));
}
$('#filter-btn').click(() => {
  let column = $('#dropdown-btn').textContent(),
    value = $('#column-input').val().trim(), query = '';
  if (column === '' || value === '') return;
  query = `filter=${column}&value=${value}`;
  $.ajax({
    method: 'GET',
    url: `/${tableURL}?${query}`
  }).done((data) => {
    refreshTable(data);
    createFilterResetButton();
    filterQuery = query;
  }).fail((jqXHR, textStatus) => {
    filterQuery = '';
    alert("Request failed: " + textStatus);
  });
});

$('#dropdown-btn').one('click', () => {
  let dropdown = $('#column-dropdown');
  $('#data-table > thead th').each(function () {
    dropdown.append($('<li></li>').append(
      $('<a></a>').attr('href', '#').text($(this).textContent())
    ));
  });
});
$('#column-dropdown').on('click', 'li a', function (e) {
  e.preventDefault();
  $('#dropdown-btn').html(`${$(this).text()} <span class="caret"></span>`);
});