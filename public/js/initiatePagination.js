$(document).ready(() => {
    $('#pagination').twbsPagination({
        totalPages: $('#pagination').data('total'),
        visiblePages: 20,
        onPageClick: (event, page) => {
            var request = $.ajax({
                url: `/buildings?page=${page}`,
                method: 'GET'
            });

            request.done(renderTable);

            request.fail((jqXHR, textStatus) => {
                alert('Request failed: ' + textStatus);
            });
        }
    });
});

let renderTable = (data) => {
    const ID = 'Id';
    let table = $('<table></table>')
        .addClass('table table-bordered table-hover')
        .attr('id', 'data-table');
    let tHead = $('<thead></thead>');
    let tr = $('<tr></tr>');
    for (let header of Object.keys(data[0])) {
        if (header === ID) continue;
        let th = $('<th></th>').text(header);
        tr.append(th);
    }
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

let createModal = (name, id) => {
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
    modalContent.append(modalHeader);
    modalContent.append(modalBody);
    modalContent.append(modalFooter);
    modalDialog.append(modalContent);
    modal.append(modalDialog);
    return modal;
}

let openEditModal = (modalName, modalId, method, url, record) => {
    let modal = createModal(modalName, modalId);
    let modalBody = $('.modal-body', modal);
    let modalFooter = $('.modal-footer', modal);

    let form = $('<form></form>').addClass('form-horizontal')
        .submit(function (e) {
            e.preventDefault();
            $.ajax({
                method,
                url,
                data: $(this).serialize()
            }).done((data) => {
                window.alert(data);
                $(`#${modalId}`).modal('hide');
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
        })
        .appendTo(modalFooter);

    $(window.document.body).append(modal);
    $(`#${modalId}`).modal();
    $(`#${modalId}`).on('hidden.bs.modal', function() {
        $(this).remove();
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
$('#edit-btn').click(function () {
    var record = $('#data-table > tbody > tr[class$="active"]');
    if (!record.length) return;
    openEditModal('Record Editor', 'edit-modal', 'PUT', `/building/${record.data('id')}`, record);
});

$('#new-btn').click(function () {
    openEditModal('New Record', 'new-modal', 'POST', '/building');
});