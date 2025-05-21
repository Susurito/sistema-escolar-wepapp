import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventoService } from '../../services/evento.service';

declare var $:any;

@Component({
  selector: 'app-editar-evento-modal',
  templateUrl: './editar-evento-modal.component.html',
  styleUrls: ['./editar-evento-modal.component.scss']
})
export class EditarEventoModalComponent implements OnInit {

  public rol:string = "";
  public evento: any = {};

  constructor(
    private eventoService: EventoService,
    private dialogRef: MatDialogRef<EditarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ){

  }

  ngOnInit(): void {
    this.evento = { ...this.data };
  }

  public cerrar_modal(){
    this.dialogRef.close({isEdit:false});
  }
  public editar_evento(): void {
    // Validar evento (opcional)
    const errores = this.eventoService.validarEvento(this.evento, true);
    if (!$.isEmptyObject(errores)) {
      alert("Corrige los errores antes de continuar");
      return;
    }

    // Convertir horas a 24h
    this.evento.hora_inicio = this.convertirHora12a24(this.evento.hora_inicio);
    this.evento.hora_final = this.convertirHora12a24(this.evento.hora_final);

    this.eventoService.editarEvento(this.evento).subscribe(
      (response) => {
        console.log("Evento actualizado:", response);
        this.dialogRef.close({ isEdit: true });
      },
      (error) => {
        alert("No se pudo editar el evento");
        console.error(error);
      }
    );
  }

  public convertirHora12a24(hora12: string): string {
    if (!hora12) return '';
    const [time, modifier] = hora12.split(' ');
    if (!time || !modifier) return hora12;
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');

    return `${horasStr}:${minutosStr}`;
  }

  public convertirHora24a12(hora24: string): string {
    if (!hora24) return '';
    let [hours, minutes] = hora24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convierte 0 -> 12
    const horasStr = hours.toString().padStart(2, '0');
    const minutosStr = minutes.toString().padStart(2, '0');
    return `${horasStr}:${minutosStr} ${ampm}`;
  }
}
