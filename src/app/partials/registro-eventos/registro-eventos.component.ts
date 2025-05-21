import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { EventoService } from 'src/app/services/evento.service';
import { MaestrosService } from '../../services/maestros.service';
import { forkJoin } from 'rxjs';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';
import { MatDialog } from '@angular/material/dialog';

declare var $:any;

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit{
  @Input() datos_user: any = {};

  public tipo: string = "";
  public editar:boolean = false;
  public errors:any = {};
  public evento:any = {};
  public idEvento:number = 0;
  public esEstudiante: boolean = false;


  //Para el select1
  public tipos: any[] = [
    {value: '1', viewValue: 'Conferencia'},
    {value: '2', viewValue: 'Taller'},
    {value: '3', viewValue: 'Seminario'},
    {value: '4', viewValue: 'Concurso'},
  ];

  //Para el select2
  public programa: any[] = [
    {value: '1', viewValue: 'Ingeniería en Ciencias de la Computación'},
    {value: '2', viewValue: 'Licenciatura en Ciencias de la Computación'},
    {value: '3', viewValue: 'Ingeniería en Tecnologías de la Información'},
  ];

  public responsable: any[] = [];

  //Para el check
  public publico:any[] = [
    {value: '1', nombre: 'Estudiantes'},
    {value: '2', nombre: 'Profesores'},
    {value: '3', nombre: 'Publico en general'}
  ];

  constructor(
    private location : Location,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private EventoService: EventoService,
    private administradoresServices: AdministradoresService,
    private maestrosService: MaestrosService,
    public dialog: MatDialog
  ){

  }

  ngOnInit(): void {
    this.cargarResponsables();
    this.evento = this.EventoService.esquemaEvento();
    //Imprimir datos en consola
    console.log("Evento: ", this.evento)

    // El if valida si existe un parámetro en la URL
    if (this.activatedRoute.snapshot.params['id'] !== undefined) {
      this.editar = true;
      // Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID del evento: ", this.idEvento);

      // Llamamos al método que obtiene los datos del evento por su ID
      this.obtenerEventoPorID();
    }

  }

  public obtenerEventoPorID() {
    this.EventoService.getEventoByID(this.idEvento).subscribe(
      (response: any) => {
        console.log("Evento obtenido del backend:", response);

        // Convertir las horas a 12 horas con AM/PM para que el timepicker las entienda
        response.hora_inicio = this.convertirHora24a12(response.hora_inicio);
        response.hora_final = this.convertirHora24a12(response.hora_final);

        this.evento = response;

        console.log("Evento preparado para editar:", this.evento);
      },
      (error) => {
        console.error("Error al obtener el evento:", error);
      }
    );
  }




  public registrar(){
    //Validación del formulario
    this.errors = [];

    this.errors = this.EventoService.validarEvento(this.evento, this.editar);
    if(!$.isEmptyObject(this.errors)){
      return false;
    }
    // Aquí se ejecuta la lógica para registrar un evento
    this.EventoService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        console.log("Evento registrado: ", response);
        this.router.navigate(["home"]); // o cualquier ruta que apliques
      },
      (error) => {
        alert("No se pudo registrar el evento");
        console.error(error);
      }
    );
  }

  public actualizar() {
    const dialogRef = this.dialog.open(EditarEventoModalComponent, {
      data: this.evento, // Le mandas el evento a editar
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isEdit) {
        alert("Evento editado correctamente");
        this.router.navigate(["home"]);
      } else {
        console.log("Edición cancelada");
      }
    });
  }




  public regresar(){
    this.location.back();
  }




  public cargarResponsables() {
    this.maestrosService.obtenerListaMaestros().subscribe(maestros => {
      this.administradoresServices.obtenerListaAdmins().subscribe(admins => {
        const maestrosMap = maestros.map((m: any) => ({
          id: m.id,
          nombre: `${m.user.first_name} ${m.user.last_name}`
        }));

        const adminsMap = admins.map((a: any) => ({
          id: a.id,
          nombre: `${a.user.first_name} ${a.user.last_name}`
        }));

        this.responsable = [...maestrosMap, ...adminsMap];
      });
    });
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



  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      !(charCode >= 48 && charCode <= 57) &&  // Números
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

  public signosBasicos(event: KeyboardEvent) {
  const char = event.key;

  // Expresión regular que permite:
  // Letras (a-z A-Z), números (0-9), espacio y signos de puntuación básicos
  const regex = /^[a-zA-Z0-9 .,;:!?¡¿'"()\-_/]*$/;

  if (!regex.test(char)) {
    event.preventDefault();
  }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.evento.fecha_evento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.evento.fecha_evento);
  }

  //Función para detectar el cambio de hora
  public changeHoraInicio(event: any) {
    console.log("Hora inicio (12h):", event);
    // Convertir a formato 24h
    this.evento.hora_inicio = this.convertirHora12a24(event);
    console.log("Hora inicio guardada para enviar (24h):", this.evento.hora_inicio);
  }

  public changeHoraFinal(event: any) {
    console.log("Hora final (12h):", event);
    this.evento.hora_final = this.convertirHora12a24(event);
    console.log("Hora final guardada (24h):", this.evento.hora_final);
  }

  //Función para detectar el cambio de hora


  public checkboxChange(event: any) {
    console.log("Evento: ", event);

    if (event.checked) {
      this.evento.publico_json.push(event.source.value);
    } else {
      this.evento.publico_json = this.evento.publico_json.filter(
        (publico: string) => publico !== event.source.value
      );
    }

    // Verificar si "Estudiante" está seleccionado
    this.esEstudiante = this.evento.publico_json.includes("Estudiantes");

    console.log("Array público: ", this.evento.publico_json);
    console.log("¿Es estudiante?", this.esEstudiante);
  }


  public revisarSeleccion(nombre: string){
    if(this.evento.publico_json){
      var busqueda = this.evento.publico_json.find((element)=>element==nombre);
      if(busqueda != undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

}
