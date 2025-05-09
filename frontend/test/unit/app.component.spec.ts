import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from '../../src/app/app.component';
import { PropertiesService } from '../../src/app/properties.service';
import { SessionInfoService } from '../../src/app/sessioninfo/session-info.service';
import { ReleaseNotificationService } from '../../src/app/shared/release-notification.service';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let routerMock: any;
    let releaseNotificationService: ReleaseNotificationService;

    beforeEach(waitForAsync(() => {
        routerMock = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        releaseNotificationService = jasmine.createSpyObj('ReleaseNotificationService', ['startPolling']);
        TestBed.configureTestingModule({
            declarations: [AppComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [],
            providers: [
                {
                    provide: PropertiesService,
                    useValue: {
                        LOGIN_URL: 'https://access.prepdev.ripe.net/',
                        LOGOUT_URL: 'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
                        RIPE_APP_WEBCOMPONENTS_ENV: 'pre',
                        BREAKPOINTS_MOBILE_VIEW: 1025,
                        isTestEnv: () => false,
                        isTrainingEnv: () => false,
                        isRcEnv: () => false,
                        isProdEnv: () => true,
                    },
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: () => {},
                        navigateByUrl: () => {},
                        url: '/not-query',
                    },
                },
                { provide: SessionInfoService, useValue: { expiredSession$: of(), showUserLoggedIcon$: of() } },
                {
                    provide: ReleaseNotificationService,
                    useValue: releaseNotificationService,
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    });

    it('should start checking if new release is available', () => {
        fixture.detectChanges();
        expect(releaseNotificationService.startPolling).toHaveBeenCalled();
    });

    it('should set properties to app-switcher', () => {
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('app-switcher'));
        expect(appSwitch.properties.appenv).toBe('pre');
        expect(appSwitch.properties.current).toBe('database');
    });

    it('should set properties to user-login', () => {
        fixture.detectChanges();
        const appSwitch = fixture.debugElement.query(By.css('user-login'));
        expect(appSwitch.properties.accessurl).toBe('https://access.prepdev.ripe.net/');
        expect(appSwitch.properties.logoutredirecturl).toBe(
            'https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/query',
        );
    });
});
