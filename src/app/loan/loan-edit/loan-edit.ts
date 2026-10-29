import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoanService } from '../loan.service';
import { Loan } from '../model/Loan';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/model/Game';
import { ClientService } from '../../client/client.service';
import { Client } from '../../client/model/Client';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { validateFields } from '../../core/helpers/validation.helper';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-loan-edit',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule ],
    templateUrl: './loan-edit.html',
    styleUrl: './loan-edit.css',
})
export class LoanEdit implements OnInit {
    protected readonly loanService = inject(LoanService);
    protected readonly dialogRef = inject(MatDialogRef<LoanEdit>);
    protected readonly data = inject(MAT_DIALOG_DATA)  as { loan?: Loan }
    protected readonly gameService = inject(GameService);
    protected readonly clientService = inject(ClientService);

    protected readonly id = signal<number | null>(null);
    protected readonly gameId = signal<number | null>(null);
    protected readonly clientId = signal<number | null>(null);
    protected readonly startDate = signal<Date | null>(null);
    protected readonly endDate = signal<Date | null>(null);
    protected readonly games = signal<Game[]>([]);
    protected readonly clients = signal<Client[]>([]);
    protected readonly errorMessage = signal<string | null>(null);


    ngOnInit(): void {
    this.loadFormData(this.data.loan ?? null);
    }

    loadFormData(initialData: Loan | null) {
        this.id.set(initialData?.id ?? null);

        this.gameService.getGames().subscribe((gams) => {
            this.games.set(gams);
            this.gameId.set(initialData?.game?.id ?? null);
        });

        this.clientService.getClients().subscribe((clis) => {
            this.clients.set(clis);
            this.clientId.set(initialData?.client?.id ?? null);
        });

        this.startDate.set(this.toDate(initialData?.startDate));
        this.endDate.set(this.toDate(initialData?.endDate));
    }

    onSave() {
        const id = this.id();
        const gameId = this.gameId();
        const clientId = this.clientId();
        const startDate = this.toText(this.startDate());
        const endDate = this.toText(this.endDate());

        const requiredFields = ["gameId", "clientId", "startDate", "endDate"] as const
        const data = { gameId, clientId, startDate, endDate }

        if (!validateFields(data, requiredFields)) {
            return;
        }

        const loan = {
            id,
            game: this.games().find(g => g.id === gameId) ?? null,
            client: this.clients().find(c => c.id === clientId) ?? null,
            startDate,
            endDate,
        } as Loan;

        this.errorMessage.set('');

        this.loanService.saveLoan(loan).subscribe({
            next:() => {
            this.dialogRef.close(true);
            },
        
        error: (err) => {
            const message = err.error?.message;

            if(message === 'Fecha de devolución anterior a fecha de préstamo') {
                this.errorMessage.set('La fecha de devolución no puede ser anterior a la fecha de préstamo');
        } else if (message === 'Los préstamos no pueden exceder de 14 días') {
                this.errorMessage.set('El préstamo no puede superar los 14 días');
        } else if (message === 'Juego no disponible') {
                this.errorMessage.set('El juego ya está prestado en las fechas seleccionadas');
        } else if (message === 'El cliente ya tiene 2 préstamos') {
                this.errorMessage.set('El cliente ya tiene 2 préstamos en las fechas seleccionadas');
        } else {
            this.errorMessage.set('Se ha producido un error al guardar el préstamo');
        }
        },

      });

    }

//PROBANDO METODOS CONVERSION
    private toDate (text: string | null | undefined): Date | null {
        if (!text) {
            return null;
        }
        const parts = text.split('-');
        return new Date (Number(parts[0]), Number(parts[1]) -1, Number(parts[2]));
    }

    private toText (date: Date | null): string | null {
        if (!date) {
            return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
//PROBANDO METODOS CONVERSION

    onClose() {
        this.dialogRef.close(false);
    }
}