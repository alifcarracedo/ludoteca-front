import { Component, OnInit, signal, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LoanEdit } from '../loan-edit/loan-edit';
import { LoanService } from '../loan.service';
import { Loan } from '../model/Loan';
import { GameService } from '../../game/game.service';
import { Game } from '../../game/model/Game';
import { ClientService } from '../../client/client.service';
import { Client } from '../../client/model/Client';
import { Pageable } from '../../core/model/page/Pageable';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-loan-list',
    standalone: true,
    imports: [
        MatButtonModule, 
        MatIconModule, 
        MatTableModule, 
        MatPaginatorModule, 
        CommonModule, 
        FormsModule, 
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule 
    ],
    templateUrl: './loan-list.page.html',
    styleUrl: './loan-list.page.css',
})
export class LoanList implements OnInit {
    pageNumber: number = 0;
    pageSize: number = 5;
    totalElements: number = 0;

    dataSource = new MatTableDataSource<Loan>();
    displayedColumns: string[] = ['id', 'game', 'client', 'startDate', 'endDate', 'action'];

    protected readonly loans = signal<Loan[]>([]);
    protected readonly games = signal<Game[]>([]);
    protected readonly clients = signal<Client[]>([]);
    protected readonly startDate = signal<string>('');
    protected readonly endDate = signal<string>('');
    protected readonly filterGameId = signal<number | null>(null);
    protected readonly filterClientId = signal<number | null>(null);
    protected readonly filterDate = signal<Date | null>(null);

    protected readonly loanService = inject(LoanService);
    protected readonly gameService = inject(GameService);
    protected readonly clientService = inject(ClientService);
    protected readonly dialog = inject(MatDialog);

    ngOnInit(): void {
        this.loadPage();
        this.gameService.getGames().subscribe((games) => this.games.set(games));
        this.clientService.getClients().subscribe((clients) => this.clients.set(clients));
    }

    loadPage(event?: PageEvent) {
        const pageable: Pageable = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            sort: [
                {
                    property: 'id',
                    direction: 'ASC',
                },
            ],
        };

        if (event != null) {
            pageable.pageSize = event.pageSize;
            pageable.pageNumber = event.pageIndex;
        }

        this.loanService.getLoans(pageable, this.filterGameId(), this.filterClientId(), this.toText(this.filterDate())).subscribe((data) => {
            this.dataSource.data = data.content;
            this.pageNumber = data.pageable.pageNumber;
            this.pageSize = data.pageable.pageSize;
            this.totalElements = data.totalElements;

        });
    }

    onSearch() {
        this.pageNumber = 0;
        this.loadPage();
    }

    onCleanFilter() {
        this.filterGameId.set(null);
        this.filterClientId.set(null);
        this.filterDate.set(null);
        this.onSearch();
    }

    createLoan() {
        const dialogRef = this.dialog.open(LoanEdit, {
            data: {},
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.ngOnInit();
        });
    }

    editLoan(loan: Loan) {
        const dialogRef = this.dialog.open(LoanEdit, {
            data: { loan: loan },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.ngOnInit();
        });
    }

    deleteLoan(loan: Loan) {
        const dialogRef = this.dialog.open(DialogConfirmation, {
            data: {
                title: 'Eliminar préstamo',
                description:
                    'Atención si borra el préstamo se perderán sus datos.<br> ¿Desea eliminar el préstamo?',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loanService.deleteLoan(loan.id).subscribe((result) => {
                    this.ngOnInit();
                });
            }
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
}
