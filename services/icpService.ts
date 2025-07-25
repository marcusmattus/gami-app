import { HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ICPAuthState {
  isAuthenticated: boolean;
  principal: string | null;
  identity: Identity | null;
}

export class ICPService {
  private authClient: AuthClient | null = null;
  private agent: HttpAgent | null = null;

  async initialize(): Promise<void> {
    try {
      // For web platform, use Internet Identity
      if (Platform.OS === 'web') {
        this.authClient = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          },
        });
      }
    } catch (error) {
      console.warn('ICP initialization failed, using mock mode:', error);
    }
  }

  async login(): Promise<ICPAuthState> {
    try {
      if (Platform.OS === 'web' && this.authClient) {
        return new Promise((resolve) => {
          this.authClient!.login({
            identityProvider: 'https://identity.ic0.app',
            onSuccess: async () => {
              const identity = this.authClient!.getIdentity();
              const principal = identity.getPrincipal().toString();
              
              await AsyncStorage.setItem('icp_principal', principal);
              
              resolve({
                isAuthenticated: true,
                principal,
                identity,
              });
            },
            onError: () => {
              resolve({
                isAuthenticated: false,
                principal: null,
                identity: null,
              });
            },
          });
        });
      } else {
        // Mock authentication for mobile platforms
        const mockPrincipal = 'rdmx6-jaaaa-aaaah-qcaiq-cai';
        await AsyncStorage.setItem('icp_principal', mockPrincipal);
        
        return {
          isAuthenticated: true,
          principal: mockPrincipal,
          identity: null,
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        isAuthenticated: false,
        principal: null,
        identity: null,
      };
    }
  }

  async logout(): Promise<void> {
    try {
      if (Platform.OS === 'web' && this.authClient) {
        await this.authClient.logout();
      }
      await AsyncStorage.removeItem('icp_principal');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getStoredAuth(): Promise<ICPAuthState> {
    try {
      const principal = await AsyncStorage.getItem('icp_principal');
      
      if (principal) {
        if (Platform.OS === 'web' && this.authClient) {
          const identity = this.authClient.getIdentity();
          return {
            isAuthenticated: true,
            principal,
            identity,
          };
        } else {
          return {
            isAuthenticated: true,
            principal,
            identity: null,
          };
        }
      }
    } catch (error) {
      console.error('Failed to get stored auth:', error);
    }

    return {
      isAuthenticated: false,
      principal: null,
      identity: null,
    };
  }

  // Mock blockchain operations for demo
  async getTokenBalance(tokenType: string): Promise<number> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const balances: Record<string, number> = {
      GAMI: Math.floor(Math.random() * 500) + 200,
      QUEST: Math.floor(Math.random() * 100) + 50,
      LOCAL: Math.floor(Math.random() * 150) + 75,
      FIT: Math.floor(Math.random() * 200) + 100,
      PROD: Math.floor(Math.random() * 100) + 50,
    };
    
    return balances[tokenType] || 0;
  }

  async completeQuest(questId: string): Promise<{ success: boolean; reward: number }> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reward = Math.floor(Math.random() * 100) + 25;
    const success = Math.random() > 0.1; // 90% success rate
    return { success, reward };
  }

  async transferTokens(to: string, amount: number, tokenType: string): Promise<boolean> {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    return Math.random() > 0.05; // 95% success rate
  }
}

export const icpService = new ICPService();