import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../category.service';
import { Category } from '../model/Category';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule ],
    templateUrl: './category-edit.html',
    styleUrl: './category-edit.css'
})
export class CategoryEdit implements OnInit {
    protected readonly dialogRef = inject(MatDialogRef<CategoryEdit>);
    protected readonly categoryService = inject(CategoryService);
    protected readonly data = inject(MAT_DIALOG_DATA) as { category?: Category }

    protected readonly id = signal<number | null>(null);
    protected readonly name = signal<string | null>(null);

    ngOnInit(): void {
        this.loadFormData();
    }

    loadFormData(): void {
        console.log(this.data);
        this.id.set(this.data.category?.id ?? null);
        this.name.set(this.data.category?.name ?? null);
    }

    onSave() {
        const id = this.id();
        const name = this.name();

        if(!name) {
            return;
        }

        const category = { id, name } as Category;
        this.categoryService.saveCategory(category).subscribe(() => {
            this.dialogRef.close(true);
        });
    }

    onClose() {
        this.dialogRef.close();
    }
}
