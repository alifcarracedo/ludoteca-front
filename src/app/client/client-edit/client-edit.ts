import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClientService } from '../client.service';
import { Client } from '../model/Client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-client-edit',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule ],
    templateUrl: './client-edit.html',
    styleUrl: './client-edit.css'
})
export class ClientEdit implements OnInit {
    protected readonly dialogRef = inject(MatDialogRef<ClientEdit>);
    protected readonly clientService = inject(ClientService);
    protected readonly data = inject(MAT_DIALOG_DATA) as { client?: Client }

    protected readonly id = signal<number | null>(null);
    protected readonly name = signal<string | null>(null);
    protected readonly errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        this.loadFormData();
    }

    loadFormData(): void {
        console.log(this.data);
        this.id.set(this.data.client?.id ?? null);
        this.name.set(this.data.client?.name ?? null);
    }

    onSave() {
        const id = this.id();
        const name = this.name();

        if(!name) {
            return;
        }

        const client = { id, name } as Client;

        this.errorMessage.set(null);

        this.clientService.saveClient(client).subscribe({
            next:() => {
            this.dialogRef.close(true);
        },
        error: (err) => {
                this.errorMessage.set('Ya existe un cliente con ese nombre');
        }
    
      });
    }

    onClose() {
        this.dialogRef.close();
    }
}
