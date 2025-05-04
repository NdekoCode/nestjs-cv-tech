'use client';;
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { sendAuthCodeAPI } from '@/core/services/clients/auth/auth';

import { useQuery } from '../common';

type AuthCodeRef = {
	focus: () => void;
	clear: () => void;
};

export function useAuthenticationPasscode() {
	const query = useSearchParams();


	const queryEmail = useMemo(() => {
		const emailQuery = query?.get('email') || '';

		if (typeof localStorage !== 'undefined') {
			localStorage?.setItem('ever-teams-start-email', emailQuery);
		}
		return emailQuery;
	}, [query]);

	const queryCode = useMemo(() => {
		return query?.get('code');
	}, [query]);

	const inputCodeRef = useRef<AuthCodeRef | null>(null);
	const [screen, setScreen] = useState<'email' | 'passcode' | 'workspace'>('email');
	const [defaultTeamId, setDefaultTeamId] = useState<string | undefined>(undefined);
	const [authenticated, setAuthenticated] = useState(false);

	const [formValues, setFormValues] = useState({
		email: queryEmail,
		code: ''
	});

	const [errors, setErrors] = useState({} as { [x: string]: any });
	// Queries
	const { queryCall: sendCodeQueryCall, loading: sendCodeLoading } = useQuery(sendAuthCodeAPI);



	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormValues((prevState) => ({ ...prevState, [name]: value }));
	};
	return {
		errors,
		sendCodeLoading,
		handleChange,
		formValues,
		setFormValues,
		inputCodeRef,
		setErrors,
		authScreen: { screen, setScreen },
		authenticated,
		setAuthenticated,
		defaultTeamId,
		sendCodeQueryCall,
	};
}

export type TAuthenticationPasscode = ReturnType<typeof useAuthenticationPasscode>;
