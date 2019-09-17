import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  NgZone,
  EventEmitter,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormMode } from "src/app/models";
import { ErrorService, ErrorType } from "src/app/services/error.service";
import { UserService } from "src/app/services/user.service";
import { RolesService } from "src/app/services/roles.service";
import { ValidationService } from "src/app/services/validation.service";
import { AlertService } from "src/app/services/alert.service";
import { RouterService } from "src/app/services/router.service";
import { LoadingService } from "src/app/services/loading.service";
import { DummyService } from "src/app/services/dummy.service";
import { UserAccessType } from 'src/app/models/Role';
import { AppRoutes } from 'src/app/constants';
import { DropdownObject, DropdownService } from 'src/app/services/dropdown.service';
import { FormService, FormConfigField } from 'src/app/services/form/form.service';
import * as moment from 'moment';

@Component({
  selector: 'app-base-form',
  templateUrl: './base-form.component.html',
  styleUrls: ['./base-form.component.css']
})
export class BaseFormComponent implements OnInit, AfterViewChecked {
  formLoadingIconLoop = true;
  formLoadingIcon = 'https://assets2.lottiefiles.com/datafiles/qq04nAXfKjPV6ju/data.json';
  public componentName = ` `;
  private responseBody = {};

  /**
   * User access type
   */
  public accessType: UserAccessType = UserAccessType.DataViewer;

  /**
   * Show/Hide Add edit button
   * This value will only change
   * when is called ngOnInit().
   * if you wish to manually refresh,
   * call this.setAccessType().
   */
  public get isDataEditor(): boolean {
    return this.roles.canCreate(this.accessType);
  }

  // State flags
  private submitted = false;
  private inReviewMode = false;
  get readonly(): boolean {
    return this.mode === FormMode.View;
  }
  /////////////////

  /**
     Message displayed after submission
  */
  get submitedMessage(): string {
    if (this.creating) {
      return `Entries Added`;
    } else if (this.editing) {
      return `Edits Submitted`;
    }
    return ``;
  }

  // Lottie Animation
  public lottieConfig: Object;
  private anim: any;
  private animationSpeed = 1;
  /////////////////

  /**
   * submit button title for different states
   */
  get submitBtnName(): string {
    let prefix: string;
    switch (this.mode) {
      case FormMode.Create: {
        prefix = `Submit`;
        break;
      }
      case FormMode.Edit: {
        prefix = `Submit Edits`;
        break;
      }
      case FormMode.View: {
        if (this.inReviewMode) {
          prefix = `Confirm`;
        }
        break;
      }
      default:
        return `How are you here?`;
    }
    if (prefix) {
      return `${prefix}`;
    } else {
      return ``;
    }
  }
  /* ***** */

  /**
   * Page title for different states
   */
  get pageTitle(): string {
    let prefix: string;
    switch (this.mode) {
      case FormMode.Create: {
        prefix = `Add`;
        break;
      }
      case FormMode.Edit: {
        prefix = `Edit`;
        break;
      }
      case FormMode.View: {
        if (this.inReviewMode) {
          prefix = `Confirm`;
        }
        prefix = `View`;
        break;
      }
      default:
        return `How are you here?`;
    }
    if (prefix) {
      return `${prefix} ${this.componentName}`;
    } else {
      return ``;
    }
  }
  /* ***** */

  ///// Form Mode
  private _mode: FormMode = FormMode.Edit;
  // Get
  get mode(): FormMode {
    return this._mode;
  }
  // Set
  @Input() set mode(mode: FormMode) {
    console.log(`Form mode is ${mode}`);
    this._mode = mode;
  }
  ////////////////////

  ///// States Baed on Routes
  private get viewing() {
    const current = this.router.current;
    return (
      current === AppRoutes.ViewMechanicalTreatment ||
      current === AppRoutes.ViewObservation
    );
  }

  private get creating() {
    const current = this.router.current;
    return (
      current === AppRoutes.AddMechanicalTreatment ||
      current === AppRoutes.AddObservation
    );
  }

  private get editing() {
    const current = this.router.current;
    return (
      current === AppRoutes.EditMechanicalTreatment ||
      current === AppRoutes.EditObservation
    );
  }

  private config: any = {};

  constructor(
    // private mechanicalTreatmentService: MechanicalTreatmentService,
    private errorService: ErrorService,
    private userService: UserService,
    private roles: RolesService,
    private validation: ValidationService,
    private alert: AlertService,
    private router: RouterService,
    private loadingService: LoadingService,
    private dummy: DummyService,
    private dropdownService: DropdownService,
    private formService: FormService
  ) {
    this.lottieConfig = {
      path:
        "https://assets4.lottiefiles.com/datafiles/jEgAWaDrrm6qdJx/data.json",
      renderer: "canvas",
      autoplay: true,
      loop: false
    };
  }

  ngOnInit() {
    this.initialize();
  }

  ngAfterViewChecked(): void { }

  /**
   * Setting User's access type
   */
  private async setAccessType() {
    this.loadingService.add();
    this.accessType = await this.userService.getAccess();
    this.loadingService.remove();
  }

  async initialize() {
    await this.setAccessType();
    this.config = await this.formService.getMechanicalTreatmentUIConfig();
  }

  fieldChanged(field: any, event: any) {
    if (field.isLocationField) {
      // location field
      this.responseBody[field.latitude.key] = event.latitude.value;
      this.responseBody[field.latitude.key] = event.longitude.value;
    } else if (field.isDropdown) {
      // dropdown field
      console.log(event.object);
      for (const key in event.object) {
        if (key.toLowerCase().indexOf('id') !== -1) {
          this.responseBody[field.key] = event.object[key];
        }
      }
    } else if (field.isDateField) {
      // date field
      if (event) {
        const formatted = moment(event).format('YYYY-MM-DD');
        this.responseBody[field.key] = formatted;
      }
    } else {
      // Store key / value for regular field
      this.responseBody[field.key] = event;
    }

    console.log(this.responseBody);
  }
}
