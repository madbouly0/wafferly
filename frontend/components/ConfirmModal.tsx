"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
}: ConfirmModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 font-inter" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-xl transition-all border border-[#dce5e4]">
                                <Dialog.Title
                                    as="h3"
                                    className="text-2xl font-bold font-[Space_Grotesk] leading-6 text-[#2f2f2f] mb-3 tracking-tight"
                                >
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2 text-sm text-[#6a6a6a] leading-relaxed">
                                    <p>{description}</p>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex flex-1 justify-center rounded-xl border border-[#dce5e4] bg-white px-4 py-2.5 text-sm font-bold text-[#6a6a6a] hover:bg-[#f9f9f9] hover:text-[#2f2f2f] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b5d50] focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex flex-1 justify-center rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm
                                            ${isDestructive 
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500 hover:border-red-200' 
                                                : 'bg-[#3b5d50] text-[#f9bf29] hover:bg-[#2d4a40] focus-visible:ring-[#3b5d50]'
                                            }`}
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
