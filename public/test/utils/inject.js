import ko from 'knockout';
import _ from 'underscore';
import modal from 'modules/modal-dialog';
import * as vars from 'modules/vars';
import {register} from 'models/widgets';
import * as wait from 'test/utils/wait';
import mediator from 'utils/mediator';

export default function inject (html) {
    register();
    const DOM_ID = 'test_dom_' + Math.round(Math.random() * 10000);

    document.body.innerHTML += `
        <div id="${DOM_ID}" class="mainFlexContainer">
            ${html}
        </div>
    `;

    let container = document.getElementById(DOM_ID), baseModel;
    return {
        container,
        apply: (model, waitWidget) => {
            baseModel = model;

            return new Promise(resolve => {
                _.defaults(model, {
                    title: ko.observable('test'),
                    modalDialog: modal,
                    message: {
                        textMessage: ko.observable(),
                        codeEnvMessage: ko.observable()
                    },
                    extensions: [],
                    permissions: ko.observable(),
                    registerExtension: () => {},
                    testColumn: { registerMainWidget: widget => {
                        mediator.emit('main:widget:loaded', widget);
                    }},
                    identity: { email: 'someone@theguardian.com' },
                    isPasteActive: ko.observable(),
                    frontsList: ko.observableArray(),
                    frontsMap: ko.observable({}),
                    state: ko.observable({
                        defaults: {
							baseUrls: {
								apiBaseUrl: '/api.grid', mediaBaseUrl: 'http://media'
							}
						}
                    }),
                    dispose: () => {}
                });

                if (waitWidget) {
                    wait.event('widget:load').then(resolve);
                } else {
                    setTimeout(() => resolve(model), 10);
                }
                vars.setModel(model);
                ko.applyBindings(model, container);
            });
        },
        dispose: () => {
            modal.isOpen(false);
            modal.templateName(null);
            modal.templateData(null);
            ko.removeNode(container);
            baseModel.dispose();
        }
    };
}

export function injectColumnWidget (widget) {
    return inject('<' + widget + ' params="position: 0, column: $data.testColumn, baseModel: $root"></' + widget + '>');
}
