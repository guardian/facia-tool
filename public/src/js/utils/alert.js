import modalDialog from '../modules/modal-dialog';

/**
 * Launch a modal dialog.
 *
 * @param {string} message
 * @param {'message' | 'error'} type
 */
export default function (message, type = 'message') {
    modalDialog.confirm({
        name: 'text_alert',
        data: {
            message,
            type
        }
    });
}
