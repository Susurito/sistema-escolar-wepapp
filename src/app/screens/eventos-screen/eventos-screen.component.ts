import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EventoService } from '../../services/evento.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { EliminarEventoModalComponent } from 'src/app/modals/eliminar-evento-modal/eliminar-evento-modal.component';

declare var $:any;

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit{
  @Input() datos_user: any = {};

  public name_user:string = "";
  public rol:string = "";
  public token : string = "";
  public lista_eventos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['nombre_evento', 'tipo_evento', 'fecha_evento', 'hora_inicio', 'hora_final', 'publico_json', 'programa_educativo', 'responsable_evento', 'descripcion', 'cupo', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public facadeService: FacadeService,
    private router: Router,
    private EventoService: EventoService,
    public dialog: MatDialog
  ){

  }
  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión

    this.displayedColumns = [
      'nombre_evento',
      'tipo_evento',
      'fecha_evento',
      'hora_inicio',
      'hora_final',
      'publico_json',
      'programa_educativo',
      'responsable_evento',
      'descripcion',
      'cupo'
    ];

    if (this.rol !== 'alumno' && this.rol !== 'maestro') {
      this.displayedColumns.push('editar', 'eliminar');
    }

    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate([""]);
    }
    //Obtener eventos
    this.obtenerEventos();
    //Para paginador
    this.initPaginator();
  }

    //Para paginación
  public initPaginator(){
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      //console.log("Paginator: ", this.dataSourceIngresos.paginator);
      //Modificar etiquetas del paginador a español
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
      };
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.previousPageLabel = 'Página anterior';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
    },500);
    //this.dataSourceIngresos.paginator = this.paginator;
  }


  public obtenerEventos() {
    this.EventoService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        console.log("Eventos recibidos:", this.lista_eventos);

        // Filtrar eventos según el rol
        const eventos_filtrados = this.lista_eventos.filter(evento => {
          const publico = evento.publico_json; // arreglo de strings

          if (this.rol === 'administrador') return true;
          if (publico.includes('Publico en general')) return true;
          if (publico.includes('Estudiantes') && this.rol === 'alumno') return true;
          if (publico.includes('Profesores') && this.rol === 'maestro') return true;

          return false;
        });

        // Asignar eventos filtrados al dataSource
        this.dataSource = new MatTableDataSource<DatosEvento>(eventos_filtrados);
      },
      (error) => {
        alert("No se pudo obtener la lista de eventos");
        console.error(error);
      }
    );
  }



  public goEditar(idUser: number){
    this.router.navigate(["registro-eventos/"+idUser]);
  }

  public delete(idEvento: number) {
  const dialogRef = this.dialog.open(EliminarEventoModalComponent, {
    data: { id: idEvento },
    height: '288px',
    width: '328px',
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.isDelete) {
      console.log("Evento eliminado");
      window.location.reload();
    } else {
      alert("Evento no eliminado");
      console.log("No se eliminó el evento");
    }
  });
}

}
//Esto va fuera de la llave que cierra la clase
export interface DatosEvento {
  id: number,
  nombre_evento: string,
  tipo_evento: string,
  fecha_evento: string;
  hora_inicio: string;
  hora_final: string;
  lugar: string,
  publico_json: string[],
  programa_educativo?: string;
  responsable_evento: string,
  descripcion: string,
  cupo: number,
}
