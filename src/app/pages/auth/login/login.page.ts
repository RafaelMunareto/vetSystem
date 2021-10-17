/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';

import {
  AvailableResult,
  BiometryType,
  NativeBiometric,
} from 'capacitor-native-biometric';

import { AuthService } from 'src/app/core/services/auth.service';
import { AuthProvider } from 'src/app/core/services/auth.types';
import { CurrentPlatformService } from 'src/app/shared/services/current-plataform.service';
import { mustMatch } from 'src/app/shared/validators/validate-password.validator';
import { OverlayService } from '../../../core/services/overlay.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  authForm: FormGroup;
  authProviders = AuthProvider;
  digitalChange = false;


  configs = {
    isSignIn: true,
    action: 'Login',
    actionChange: 'Cadastro',
  };

  private nameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  private confirmPasswordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    mustMatch('password'),
  ]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private navCtrl: NavController,
    private activeRoute: ActivatedRoute,
    private overlayService: OverlayService,
    public currentPlatformService: CurrentPlatformService
  ) {}

  ngOnInit() {
    this.createForm();
    const redirect = this.activeRoute.snapshot.queryParamMap.get('redirect');
  }

  get email(): any {
    return this.authForm.get('email');
  }

  get password(): any {
    return this.authForm.get('password');
  }

  get name(): any {
    return this.authForm.get('name');
  }

  get confirmPassword(): any {
    return this.authForm.get('confirmPassword');
  }

  changeAuthAction(): void {
    this.configs.isSignIn = !this.configs.isSignIn;
    const { isSignIn } = this.configs;
    this.configs.action = isSignIn ? 'Login' : 'Cadastro';
    this.configs.actionChange = isSignIn
      ? 'Crie uma conta'
      : 'Já possuo uma conta';
    if (!isSignIn) {
      this.authForm.addControl('name', this.nameControl);
      this.authForm.addControl('confirmPassword', this.confirmPasswordControl);
    } else {
      this.authForm.removeControl('name');
      this.authForm.removeControl('confirmPassword');
    }
  }

  async onSubmit(provider: AuthProvider): Promise<void> {
    const loading = await this.overlayService.loading();
    try {
      const credentials = await this.authService.authenticate({
        isSignIn: this.configs.isSignIn,
        user: this.authForm.value,
        provider,
      });
      this.navCtrl.navigateForward(
        this.activeRoute.snapshot.queryParamMap.get('redirect') || '/home'
      );
    } catch (e) {
      await this.overlayService.toast({
        message: e.message,
      });
    } finally {
      loading.dismiss();
    }
  }

  setCredential(event) {
   this.digitalChange = event.detail.checked;
    NativeBiometric.setCredentials({
      username: this.authForm.get('email').value,
      password:  this.authForm.get('password').value,
      server: 'http://www.vetsystem.com',
    }).then().finally( () => this.digitalChange = true);
  }

  deleteCredential() {
    NativeBiometric.deleteCredentials({
      server: 'http://www.vetsystem.com',
    }).then(()=> {
      this.overlayService.toast({
        message: 'Login e senha deletados!',
      });
    });
  }


  async checkCredential(provider: AuthProvider) {
    NativeBiometric.isAvailable().then((result: AvailableResult) => {
      const isAvailable =  result.isAvailable;
      const isFaceId=result.biometryType===BiometryType.FACE_ID;
      if (isAvailable || isFaceId) {

        NativeBiometric.getCredentials({
          server: 'http://www.vetsystem.com',
        }).then((credentials) => {

            NativeBiometric.verifyIdentity({
              reason: 'Para facilitar o login',
              title: 'Log in',
              subtitle: 'vetsystem',
              description: 'Acesso via digital.',
            }).then(() => {
              this.authService.authenticate({
                isSignIn: this.configs.isSignIn,
                user: {email: credentials.username, password: credentials.password},
                provider,
              }).then(
                () => {
                  this.navCtrl.navigateForward(
                    this.activeRoute.snapshot.queryParamMap.get('redirect') || '/home'
                  );
                }
              );
            })
            .catch((err) => {
              this.overlayService.toast({
                message: err.message,
              });
            });
           }).catch(async (err) => {
              await this.overlayService.toast({
                message: err.message,
              });
            });
        }
    });
  }

  private createForm(): void {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
}
