import React, { FormEvent, useState } from "react";
import {
  OrderStatus,
  RegisterWorkerInputRole,
  useCreateCustomer,
  useCreateMaterial,
  useCreateWorkOrder,
  useListCustomers,
  useListWorkOrders,
  useRegisterWorker,
  useUpdateWorkOrderStatus,
} from "@workspace/api-client-react";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSession, getSessionUser } from "@/lib/auth-session";
import { toast } from "@/hooks/use-toast";

const STATUSES = Object.values(OrderStatus);

export default function WorkerDashboard() {
  const user = getSessionUser();
  const [, navigate] = useLocation();
  const customersQuery = useListCustomers();
  const ordersQuery = useListWorkOrders();
  const updateStatus = useUpdateWorkOrderStatus();
  const createCustomer = useCreateCustomer();
  const createMaterial = useCreateMaterial();
  const createWorkOrder = useCreateWorkOrder();
  const registerWorker = useRegisterWorker();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [materialCustomerId, setMaterialCustomerId] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [materialDesc, setMaterialDesc] = useState("");
  const [workOrderCustomerId, setWorkOrderCustomerId] = useState("");
  const [workOrderMaterialId, setWorkOrderMaterialId] = useState("");
  const [workOrderCode, setWorkOrderCode] = useState("");
  const [processType, setProcessType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [workerEmail, setWorkerEmail] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [workerRole, setWorkerRole] = useState<"operator" | "viewer" | "admin">("operator");

  if (!user) return <Redirect to="/worker/login" />;
  if (user.role === "client") return <Redirect to="/login" />;

  const onCreateCustomer = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer.mutateAsync({
        data: {
          companyName: customerName,
          contactEmail: customerEmail,
        },
      });
      setCustomerName("");
      setCustomerEmail("");
      customersQuery.refetch();
      toast({ title: "Customer created" });
    } catch (error) {
      toast({ title: "Failed to create customer", description: String(error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Worker Operations Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">
              Signed in as {user.fullName} ({user.role})
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              clearSession();
              navigate("/worker/login");
            }}
          >
            Logout
          </Button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form onSubmit={onCreateCustomer} className="border border-[#1A202C] bg-[#0D111A] p-4 space-y-3">
            <h2 className="font-semibold">Add Customer</h2>
            <Label htmlFor="customer-name">Company name</Label>
            <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Label htmlFor="customer-email">Contact email</Label>
            <Input id="customer-email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            <Button type="submit" disabled={createCustomer.isPending}>Create customer</Button>
          </form>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createMaterial.mutateAsync({
                  data: {
                    customerId: materialCustomerId,
                    materialCode,
                    description: materialDesc,
                  },
                });
                setMaterialCode("");
                setMaterialDesc("");
                toast({ title: "Material created" });
              } catch (error) {
                toast({ title: "Failed to create material", description: String(error), variant: "destructive" });
              }
            }}
            className="border border-[#1A202C] bg-[#0D111A] p-4 space-y-3"
          >
            <h2 className="font-semibold">Add Material</h2>
            <Label htmlFor="material-customer-id">Customer ID</Label>
            <Input id="material-customer-id" value={materialCustomerId} onChange={(e) => setMaterialCustomerId(e.target.value)} />
            <Label htmlFor="material-code">Material code</Label>
            <Input id="material-code" value={materialCode} onChange={(e) => setMaterialCode(e.target.value)} />
            <Label htmlFor="material-desc">Description</Label>
            <Input id="material-desc" value={materialDesc} onChange={(e) => setMaterialDesc(e.target.value)} />
            <Button type="submit" disabled={createMaterial.isPending}>Create material</Button>
          </form>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createWorkOrder.mutateAsync({
                  data: {
                    customerId: workOrderCustomerId,
                    materialId: workOrderMaterialId,
                    orderCode: workOrderCode,
                    processType,
                    quantity: Number(quantity),
                  },
                });
                setWorkOrderCode("");
                setProcessType("");
                ordersQuery.refetch();
                toast({ title: "Work order created" });
              } catch (error) {
                toast({ title: "Failed to create work order", description: String(error), variant: "destructive" });
              }
            }}
            className="border border-[#1A202C] bg-[#0D111A] p-4 space-y-3"
          >
            <h2 className="font-semibold">Create Work Order</h2>
            <Label htmlFor="wo-customer-id">Customer ID</Label>
            <Input id="wo-customer-id" value={workOrderCustomerId} onChange={(e) => setWorkOrderCustomerId(e.target.value)} />
            <Label htmlFor="wo-material-id">Material ID</Label>
            <Input id="wo-material-id" value={workOrderMaterialId} onChange={(e) => setWorkOrderMaterialId(e.target.value)} />
            <Label htmlFor="wo-code">Order code</Label>
            <Input id="wo-code" value={workOrderCode} onChange={(e) => setWorkOrderCode(e.target.value)} />
            <Label htmlFor="wo-process">Process type</Label>
            <Input id="wo-process" value={processType} onChange={(e) => setProcessType(e.target.value)} />
            <Label htmlFor="wo-quantity">Quantity</Label>
            <Input id="wo-quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <Button type="submit" disabled={createWorkOrder.isPending}>Create work order</Button>
          </form>

          {user.role === "admin" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await registerWorker.mutateAsync({
                    data: {
                      email: workerEmail,
                      fullName: workerName,
                      password: workerPassword,
                      role: workerRole as typeof RegisterWorkerInputRole[keyof typeof RegisterWorkerInputRole],
                    },
                  });
                  setWorkerEmail("");
                  setWorkerName("");
                  setWorkerPassword("");
                  toast({ title: "Worker account created" });
                } catch (error) {
                  toast({ title: "Failed to register worker", description: String(error), variant: "destructive" });
                }
              }}
              className="border border-[#1A202C] bg-[#0D111A] p-4 space-y-3"
            >
              <h2 className="font-semibold">Create Worker Account (Admin)</h2>
              <Label htmlFor="worker-email">Worker email</Label>
              <Input id="worker-email" value={workerEmail} onChange={(e) => setWorkerEmail(e.target.value)} />
              <Label htmlFor="worker-name">Worker full name</Label>
              <Input id="worker-name" value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
              <Label htmlFor="worker-password">Password</Label>
              <Input id="worker-password" type="password" value={workerPassword} onChange={(e) => setWorkerPassword(e.target.value)} />
              <Label htmlFor="worker-role">Role</Label>
              <select
                id="worker-role"
                className="w-full h-9 bg-[#0A0D14] border border-[#1A202C] px-2"
                value={workerRole}
                onChange={(e) => setWorkerRole(e.target.value as "operator" | "viewer" | "admin")}
              >
                <option value="operator">operator</option>
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
              </select>
              <Button type="submit" disabled={registerWorker.isPending}>Create worker</Button>
            </form>
          ) : (
            <div className="border border-[#1A202C] bg-[#0D111A] p-4">
              <h2 className="font-semibold">Worker Accounts</h2>
              <p className="text-sm text-gray-400 mt-2">Only admins can create new worker logins.</p>
            </div>
          )}
        </section>

        <section className="border border-[#1A202C] bg-[#0D111A]">
          <h2 className="font-semibold p-4 border-b border-[#1A202C]">In-process Work Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#121826]">
                <tr>
                  <th className="text-left p-3">Order</th>
                  <th className="text-left p-3">Process</th>
                  <th className="text-left p-3">Qty</th>
                  <th className="text-left p-3">Current Status</th>
                  <th className="text-left p-3">Update</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.items.map((order) => (
                  <tr key={order.id} className="border-t border-[#1A202C]">
                    <td className="p-3">{order.orderCode}</td>
                    <td className="p-3">{order.processType}</td>
                    <td className="p-3">{order.quantity}</td>
                    <td className="p-3 uppercase">{order.status.replace("_", " ")}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 bg-[#0A0D14] border border-[#1A202C] px-2"
                          defaultValue={order.status}
                          onChange={async (event) => {
                            try {
                              await updateStatus.mutateAsync({
                                id: order.id,
                                data: {
                                  status: event.target.value as (typeof STATUSES)[number],
                                },
                              });
                              ordersQuery.refetch();
                            } catch (error) {
                              toast({
                                title: "Status update failed",
                                description: String(error),
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ordersQuery.isLoading ? <p className="p-4 text-gray-400">Loading work orders...</p> : null}
          </div>
        </section>

        <section className="border border-[#1A202C] bg-[#0D111A] p-4">
          <h2 className="font-semibold">Customer Directory</h2>
          <p className="text-sm text-gray-400 mt-1">Active customers: {customersQuery.data?.items.length ?? 0}</p>
        </section>
      </div>
    </div>
  );
}

