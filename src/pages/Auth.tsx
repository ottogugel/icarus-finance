import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Login from "@/assets/lottie/login.json";
import Lottie from "lottie-react";
export default function Auth() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // -------------------------
  // LOGIN
  // -------------------------
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // simulação...
    setTimeout(() => {
      setSuccess("Login realizado!");
      setIsLoading(false);
      navigate("/");
    }, 1200);
  };

  // -------------------------
  // CREATE ACCOUNT
  // -------------------------
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccess("Conta criada com sucesso!");
      setIsLoading(false);
    }, 1200);
  };

  // -------------------------
  // RETURN DO COMPONENTE (AGORA CORRETO)
  // -------------------------
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-800/80 via-green-900/70"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Container que centraliza + define limite de tamanho */}
        <div className="relative z-10 flex items-center justify-center">
          <Lottie
            animationData={Login}
            loop={true}
            className="w-[500px] h-[500px]"
          />
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img
              className="h-16 w-auto object-contain"
              src="./logo.png"
              alt="Logo"
            />
          </div>

          <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                <span className="flex justify-center">
                  <p className="text-green-700">Bem</p>
                  <p className="text-green-600">-vindo!</p>
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                Faça login com sua conta para começar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="signin" className="w-full">
                {/* LOGIN */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 text-green-600 bg-gray-100 hover:bg-gray-200"
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGNUP */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome</Label>
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11"
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {error && <Alert variant="destructive">{error}</Alert>}
              {success && <Alert>{success}</Alert>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
