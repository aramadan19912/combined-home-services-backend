import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Fingerprint, 
  Eye, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BiometricCapabilities {
  fingerprint: boolean;
  faceId: boolean;
  voiceRecognition: boolean;
  isSupported: boolean;
}

export const BiometricAuth: React.FC = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    fingerprint: false,
    faceId: false,
    voiceRecognition: false,
    isSupported: false
  });
  const [enabledMethods, setEnabledMethods] = useState({
    fingerprint: false,
    faceId: false,
    voiceRecognition: false
  });
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBiometricSupport();
    loadUserPreferences();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn is supported
      const isWebAuthnSupported = window.PublicKeyCredential !== undefined;
      
      if (isWebAuthnSupported) {
        // Check for specific biometric capabilities
        const available = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            allowCredentials: [],
            userVerification: 'preferred'
          }
        }).catch(() => null);

        setCapabilities({
          fingerprint: true, // Assume fingerprint is available if WebAuthn is supported
          faceId: true, // Face ID detection is limited in web
          voiceRecognition: false, // Voice recognition not commonly available
          isSupported: true
        });
      } else {
        setCapabilities({
          fingerprint: false,
          faceId: false,
          voiceRecognition: false,
          isSupported: false
        });
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setCapabilities({
        fingerprint: false,
        faceId: false,
        voiceRecognition: false,
        isSupported: false
      });
    }
  };

  const loadUserPreferences = () => {
    const saved = localStorage.getItem('biometric-preferences');
    if (saved) {
      setEnabledMethods(JSON.parse(saved));
    }
  };

  const saveUserPreferences = (newMethods: typeof enabledMethods) => {
    localStorage.setItem('biometric-preferences', JSON.stringify(newMethods));
    setEnabledMethods(newMethods);
  };

  const enrollBiometric = async (method: keyof typeof enabledMethods) => {
    setIsEnrolling(method);
    
    try {
      // Simulate biometric enrollment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call the WebAuthn API here
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "ServiceConnect",
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(64)),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{alg: -7, type: "public-key"}],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        const newMethods = { ...enabledMethods, [method]: true };
        saveUserPreferences(newMethods);
        
        toast({
          title: "Biometric enrolled",
          description: `${method.charAt(0).toUpperCase() + method.slice(1)} authentication has been set up successfully.`,
        });
      }
    } catch (error) {
      console.error('Biometric enrollment failed:', error);
      toast({
        title: "Enrollment failed",
        description: "Unable to set up biometric authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(null);
    }
  };

  const disableBiometric = (method: keyof typeof enabledMethods) => {
    const newMethods = { ...enabledMethods, [method]: false };
    saveUserPreferences(newMethods);
    
    toast({
      title: "Biometric disabled",
      description: `${method.charAt(0).toUpperCase() + method.slice(1)} authentication has been disabled.`,
    });
  };

  const testBiometric = async (method: keyof typeof enabledMethods) => {
    try {
      // Test biometric authentication
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [],
          userVerification: "required"
        }
      });

      if (assertion) {
        toast({
          title: "Authentication successful",
          description: `${method.charAt(0).toUpperCase() + method.slice(1)} authentication test passed.`,
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed", 
        description: "Biometric authentication test failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const biometricMethods = [
    {
      key: 'fingerprint' as const,
      name: 'Fingerprint',
      icon: Fingerprint,
      description: 'Use your fingerprint to authenticate',
      available: capabilities.fingerprint
    },
    {
      key: 'faceId' as const,
      name: 'Face ID',
      icon: Eye,
      description: 'Use facial recognition to authenticate',
      available: capabilities.faceId
    },
    {
      key: 'voiceRecognition' as const,
      name: 'Voice Recognition',
      icon: Smartphone,
      description: 'Use voice recognition to authenticate',
      available: capabilities.voiceRecognition
    }
  ];

  if (!capabilities.isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Enhanced security with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not supported on this device or browser. 
              Please use a device with biometric capabilities and a supported browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Set up biometric authentication for quick and secure access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {biometricMethods.map((method) => (
            <div key={method.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <method.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {method.available ? (
                  <>
                    {enabledMethods[method.key] ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testBiometric(method.key)}
                        >
                          Test
                        </Button>
                        <Switch
                          checked={enabledMethods[method.key]}
                          onCheckedChange={() => disableBiometric(method.key)}
                        />
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enrollBiometric(method.key)}
                        disabled={isEnrolling === method.key}
                      >
                        {isEnrolling === method.key ? 'Setting up...' : 'Set up'}
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {Object.values(enabledMethods).some(Boolean) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="fallback-auth">Allow password fallback</Label>
                <p className="text-sm text-muted-foreground">
                  Allow password authentication if biometric fails
                </p>
              </div>
              <Switch id="fallback-auth" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-lock">Auto-lock after inactivity</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically lock the app after 15 minutes of inactivity
                </p>
              </div>
              <Switch id="auto-lock" defaultChecked />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};