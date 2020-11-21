import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { DataSet, Network } from 'vis-network/standalone';
import { ApiService } from './services/api.service';
import { GlobalsService } from './services/globals.service';
import { ToastService } from './services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    formNodes = this.fb.group({
        node: ['', Validators.required]
    });
    // nodesControl = new FormControl();
    node_list: string[] = [];

    constructor(translate: TranslateService, private api: ApiService, private globals: GlobalsService, private fb: FormBuilder, private toast: ToastService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('en');

        // Cargo del localStorage los datos de nodos usados
        let local = localStorage.getItem('kongNodes');
        if (local) {
            local = atob(local);
            this.node_list = local.split(',');
        }

    }

    ngOnInit(): void {
        // create an array with nodes
        const nodes = new DataSet([
            {id: 1, label: 'Node 1'},
            {id: 2, label: 'Node 2'},
            {id: 3, label: 'Node 3'},
            {id: 4, label: 'Node 4'},
            {id: 5, label: 'Node 5'}
        ]);

        // create an array with edges
        // @ts-ignore
        const edges = new DataSet([
            {from: 1, to: 3},
            {from: 1, to: 2},
            {from: 2, to: 4},
            {from: 2, to: 5},
            {from: 3, to: 3}
        ]);

        // create a network
        const container = document.getElementById('mynetwork');
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {};
        const network = new Network(container, data, options);
    }

    ngOnDestroy(): void {
    }

    /*
        Conecta al nodo de Kong, pidiendo su información básica
     */
    connectToNode() {
        if (this.formNodes.invalid) {
            return;
        }

        // Recojo el valor
        let node = this.nodeField.value;
        node = node.replace(new RegExp('/$'), '');

        // Guardo el nodo como valor para conectar
        this.globals.NODE_API_URL = node;

        // Conecto al nodo de Kong elegido
        this.api.getNodeInformation()
            .subscribe(res => {
                // Si ha ido bien la conexión guardo como nodo esta url
                if (!this.node_list.includes(node)) {
                    this.node_list.push(node);
                    localStorage.setItem('kongNodes', btoa(this.node_list.join(',')));
                }
            }, error => {
                this.toast.error('error.node_connection');
            });
    }

    // getter para acceder de forma más sencilla al campo
    get nodeField() { return this.formNodes.get('node'); }
}
