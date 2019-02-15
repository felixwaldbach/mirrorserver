import $ from 'jquery';
import config from '../config';

export const setUserWidgets = (user_id, data) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: config.SERVER_ADDRESS + ":" + config.SOCKET_SERVER_PORT + "/api/user/register",
            type: "POST",
            cache: false,
            contentType: 'application/json',
            data: JSON.stringify({
                "user_id": user_id,
                "widget": {
                    widget_id: data.widget_id,
                    widget_name: data.widget_name,
                    remove: false
                },
                "slot": data.slot,
                "previous_slot": data.previous_slot
            }),
            success: function (res) {
                resolve(res);
            },
            error: function (xhr, status, err) {
                reject(err);
            }
        });
    });
}